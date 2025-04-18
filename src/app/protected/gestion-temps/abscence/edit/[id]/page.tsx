"use client";

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import absenceService, { Absence, MotifAbsence } from '@/services/absenceService';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';
import { toast } from "sonner";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import { Select } from "@/components/FormElements/select";

// Fonction utilitaire pour calculer les jours ouvrés
const getBusinessDaysCount = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const currentDate = new Date(startDate);

  // Boucler à travers chaque jour
  while (currentDate <= endDate) {
    // Ignorer les weekend (0 = dimanche, 6 = samedi)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }

    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

export default function EditAbsencePage() {
  const router = useRouter();
  const params = useParams();
  const absenceId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [filteredCollaborateurs, setFilteredCollaborateurs] = useState<Collaborateur[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [joursOuvres, setJoursOuvres] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCollaborateur, setSelectedCollaborateur] = useState<Collaborateur | null>(null);
  const [motifs, setMotifs] = useState<{value: string; label: string; couleur?: string}[]>([]);
  const [motifsData, setMotifsData] = useState<MotifAbsence[]>([]);

  const [formData, setFormData] = useState<Omit<Absence, 'motif'> & { motif: string | null }>({
    collaborateurId: 0,
    dateDebut: '',
    dateFin: '',
    motif: null,
    observations: '',
  });

  const [justificatif, setJustificatif] = useState<File | null>(null);
  const [justificatifExistant, setJustificatifExistant] = useState<string | null>(null);
  const [justificatifNom, setJustificatifNom] = useState<string | null>(null);

  // Charger les données de l'absence
  useEffect(() => {
    const fetchAbsenceData = async () => {
      if (!absenceId) return;

      try {
        setIsLoading(true);
        const absenceData = await absenceService.getById(absenceId);

        setFormData({
          id: absenceData.id,
          collaborateurId: absenceData.collaborateurId,
          dateDebut: absenceData.dateDebut,
          dateFin: absenceData.dateFin,
          motif: absenceData.motif?.id?.toString() || null,
          observations: absenceData.observations || '',
        });

        // Gérer le justificatif existant
        if (absenceData.justificatifUrl) {
          setJustificatifExistant(absenceData.justificatifUrl);
          setJustificatifNom(absenceData.justificatifNom || 'Justificatif');
        }

        // Charger les infos du collaborateur pour l'affichage
        if (absenceData.collaborateurId) {
          const collaborateur = await collaborateurService.getById(absenceData.collaborateurId);
          setSelectedCollaborateur(collaborateur);
          setSearchTerm(`${collaborateur.prenom} ${collaborateur.nom}`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de l\'absence:', error);
        toast.error('Impossible de charger les données de l\'absence.');
        router.push('/protected/gestion-temps/abscence');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAbsenceData();
  }, [absenceId, router]);

  // Charger les collaborateurs actifs et les motifs d'absence
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Chargement des collaborateurs
        const allCollaborateurs = await collaborateurService.getAll();
        // Filtrer uniquement les collaborateurs actifs
        const activeCollaborateurs = allCollaborateurs.filter(
          (collab: Collaborateur) => collab.status === 'Actif'
        );
        setCollaborateurs(activeCollaborateurs);
        setFilteredCollaborateurs(activeCollaborateurs);

        // Chargement des motifs d'absence avec leurs libellés
        try {
          const motifsFromApi = await absenceService.getAllMotifs();
          setMotifsData(motifsFromApi);

          const motifOptions = motifsFromApi.map(motif => ({
            value: motif.id.toString(),
            label: motif.libelle,
            couleur: motif.couleur
          }));

          setMotifs([{ value: "", label: "Sélectionnez un motif" }, ...motifOptions]);
        } catch (e) {
          console.error('Erreur lors du chargement des motifs:', e);
          toast.error('Impossible de charger les motifs d\'absence.');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des collaborateurs:', error);
        toast.error('Impossible de charger la liste des collaborateurs.');
      }
    };

    fetchData();
  }, []);

  // Fermer le dropdown lorsqu'on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtrer les collaborateurs en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCollaborateurs(collaborateurs);
    } else {
      const filtered = collaborateurs.filter(collab =>
        `${collab.prenom} ${collab.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCollaborateurs(filtered);
    }
  }, [searchTerm, collaborateurs]);

  // Calcul des jours ouvrés lorsque les dates changent
  useEffect(() => {
    if (formData.dateDebut && formData.dateFin) {
      const startDate = new Date(formData.dateDebut);
      const endDate = new Date(formData.dateFin);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate) {
        const businessDays = getBusinessDaysCount(startDate, endDate);
        setJoursOuvres(businessDays);
      } else {
        setJoursOuvres(0);
      }
    } else {
      setJoursOuvres(0);
    }
  }, [formData.dateDebut, formData.dateFin]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'motif') {
      setFormData({
        ...formData,
        [name]: value === "" ? null : value
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'collaborateurId' ? parseInt(value, 10) : value
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectCollaborateur = (id: number, nom: string, prenom: string) => {
    const selectedCollab = collaborateurs.find(c => c.id === id) || null;
    setSelectedCollaborateur(selectedCollab);
    setFormData({
      ...formData,
      collaborateurId: id
    });
    setSearchTerm(`${prenom} ${nom}`);
    setShowDropdown(false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJustificatif(e.target.files[0]);
      // Si un nouveau fichier est sélectionné, on considère qu'il va remplacer l'ancien
      setJustificatifExistant(null);
    }
  };

  const handleDownloadJustificatif = async () => {
    if (!absenceId) return;

    try {
      const blob = await absenceService.downloadJustificatif(absenceId);

      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);

      // Créer un élément a temporaire pour le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = justificatifNom || 'justificatif';
      document.body.appendChild(a);
      a.click();

      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement du justificatif:', error);
      toast.error('Impossible de télécharger le justificatif');
    }
  };

  const validateForm = (): boolean => {
    // Vérifier que les dates sont valides
    if (formData.dateDebut && formData.dateFin) {
      const startDate = new Date(formData.dateDebut);
      const endDate = new Date(formData.dateFin);

      if (startDate > endDate) {
        setErrorMessage('La date de début doit être antérieure à la date de fin.');
        return false;
      }
    }

    // Vérifier que le collaborateur est sélectionné
    if (!formData.collaborateurId || formData.collaborateurId === 0) {
      setErrorMessage('Veuillez sélectionner un collaborateur.');
      return false;
    }

    // Vérifier que le motif est renseigné
    if (!formData.motif) {
      setErrorMessage('Veuillez saisir un motif d\'absence.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !absenceId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Trouver l'objet motif complet à partir de l'ID
      const motifId = formData.motif ? parseInt(formData.motif, 10) : null;
      const selectedMotif = motifsData.find(m => m.id === motifId);

      if (!selectedMotif) {
        throw new Error("Motif d'absence invalide");
      }

      // Préparer les données à envoyer
      const absenceData: Absence = {
        ...formData as any,
        motif: selectedMotif,
        justificatif: justificatif
      };

      // Utiliser le service pour mettre à jour l'absence
      await absenceService.update(absenceId, absenceData);

      // Afficher un message de succès
      toast.success('Absence modifiée avec succès');

      // Rediriger vers la liste des absences
      router.push('/protected/gestion-temps/abscence');
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      setErrorMessage('Une erreur est survenue lors de la modification de l\'absence. Veuillez réessayer.');
      toast.error('Une erreur est survenue lors de la modification de l\'absence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* En-tête de page */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          <Button
            variant="outline"
            onClick={() => router.push('/protected/gestion-temps/abscence')}
            className="mr-4 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          Modifier une absence
        </h1>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection du collaborateur */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sélection du Collaborateur</h2>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Collaborateur
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un collaborateur..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white pl-11"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {showDropdown && filteredCollaborateurs.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  {filteredCollaborateurs.map((collab) => (
                    <div
                      key={collab.id}
                      className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 py-2 px-4 transition-colors duration-200 ease-in-out flex items-center"
                      onClick={() => handleSelectCollaborateur(collab.id!, collab.nom, collab.prenom)}
                    >
                      <div className="h-8 w-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-200 mr-3">
                        {collab.prenom[0]}{collab.nom[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium dark:text-white">{collab.prenom} {collab.nom}</p>
                        {collab.titrePosteOccupe && <p className="text-sm text-gray-500 dark:text-gray-300">{collab.titrePosteOccupe}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDropdown && searchTerm && filteredCollaborateurs.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md py-4 text-center text-gray-500 dark:text-gray-300">
                  Aucun collaborateur trouvé
                </div>
              )}
            </div>

            <input
              type="hidden"
              name="collaborateurId"
              value={formData.collaborateurId}
              required
            />

            {formData.collaborateurId === 0 && (
              <p className="text-xs text-red-500 mt-1">Veuillez sélectionner un collaborateur</p>
            )}

            {selectedCollaborateur && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-center">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-200 mr-3">
                  {selectedCollaborateur.prenom[0]}{selectedCollaborateur.nom[0]}
                </div>
                <div>
                  <p className="font-medium dark:text-white">Collaborateur sélectionné : {selectedCollaborateur.prenom} {selectedCollaborateur.nom}</p>
                  {selectedCollaborateur.titrePosteOccupe && <p className="text-sm text-gray-600 dark:text-gray-300">{selectedCollaborateur.titrePosteOccupe}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations de période d'absence */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Période d{"'"}absence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date de début*
              </label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date de fin*
              </label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                required
              />
            </div>

            {/* Affichage des jours ouvrés calculés */}
            <div className="col-span-2">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
                <p className="text-blue-800 dark:text-blue-300 font-medium">
                  {joursOuvres > 0
                    ? `Cette période représente ${joursOuvres} jour${joursOuvres > 1 ? 's' : ''} ouvré${joursOuvres > 1 ? 's' : ''}.`
                    : 'Veuillez sélectionner des dates valides pour calculer les jours ouvrés.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations sur le motif d'absence */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Motif et informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Motif d'absence*"
                name="motif"
                items={motifs}
                value={formData.motif || ""}
                onChange={handleInputChange}
                className="dark:bg-gray-700 dark:text-white"
              />
              {/* Indicateur visuel de couleur du motif */}
              {formData.motif && (
                <div className="mt-2 flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: motifsData.find(m => m.id === parseInt(formData.motif!, 10))?.couleur || '#CCCCCC' }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {motifsData.find(m => m.id === parseInt(formData.motif!, 10))?.libelle}
                  </span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <TextAreaGroup
                name="observations"
                label="Observations complémentaires"
                placeholder="Ajoutez des informations complémentaires concernant cette absence..."
                rows={4}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={formData.observations || ''}
                handleChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Document justificatif */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Justificatif</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Téléverser un justificatif (si nécessaire)
            </label>

            {justificatifExistant && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-green-700 dark:text-green-300 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Un justificatif existe déjà
                    {justificatifNom && <span className="ml-2">: {justificatifNom}</span>}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={handleDownloadJustificatif}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Pour remplacer ce justificatif, téléversez un nouveau fichier ci-dessous.
                </p>
              </div>
            )}

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="justificatif" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none">
                    <span>Téléchargez un fichier</span>
                    <input
                      id="justificatif"
                      name="justificatif"
                      type="file"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="pl-1">ou glissez-déposez</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, PDF jusqu{"'"}à 10MB
                </p>
                {justificatif && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Nouveau fichier sélectionné: {justificatif.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => router.push('/protected/gestion-temps/abscence')}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isSubmitting ? 'Enregistrement...' : 'Mettre à jour l\'absence'}
          </Button>
        </div>
      </form>
    </div>
  );
}