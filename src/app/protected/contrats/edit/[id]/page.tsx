'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Contrat } from '@/types/Contrat';
import contratService from '@/services/contratService';
import collaborateurService from '@/services/collaborateurService';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import { Select } from "@/components/FormElements/select";
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function EditContratPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [filteredCollaborateurs, setFilteredCollaborateurs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<Contrat>({
    collaborateurId: 0,
    numeroContrat: '',
    poste: '',
    dateEmbauche: '',
    dateDebut: '',
    typeContrat: '',
    salaireBase: 0,
    status: 'Actif'
  });

  // Charger les données du contrat au chargement de la page
  useEffect(() => {
    async function loadContrat() {
      try {
        setIsLoading(true);
        // Récupérer le contrat
        const data = await contratService.getById(id);

        // Formater les dates pour l'input de type date
        if (data.dateEmbauche) {
          data.dateEmbauche = data.dateEmbauche.split('T')[0];
        }
        if (data.dateDebut) {
          data.dateDebut = data.dateDebut.split('T')[0];
        }
        if (data.dateFin) {
          data.dateFin = data.dateFin.split('T')[0];
        }

        setFormData(data);

        // Récupérer le nom du collaborateur pour l'afficher dans la recherche
        if (data.collaborateurId) {
          try {
            const collaborateur = await collaborateurService.getById(data.collaborateurId);
            setSearchTerm(`${collaborateur.prenom} ${collaborateur.nom}`);
          } catch (error) {
            console.error('Erreur lors de la récupération du collaborateur:', error);
          }
        }

        // Définir l'URL du document actuel
        if (data.id) {
          setCurrentDocumentUrl(`http://localhost:8080/api/contrats/${data.id}/document`);
        }

        setErrorMessage(null);
      } catch (error) {
        console.error('Erreur lors du chargement du contrat:', error);
        setErrorMessage('Impossible de charger les informations du contrat. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    }

    // Charger la liste des collaborateurs pour le dropdown
    const fetchCollaborateurs = async () => {
      try {
        const data = await collaborateurService.getAll();
        setCollaborateurs(data);
        setFilteredCollaborateurs(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des collaborateurs:', error);
      }
    };

    if (id) {
      loadContrat();
      fetchCollaborateurs();
    }
  }, [id]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Pour les champs numériques, convertir la valeur en nombre si nécessaire
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectCollaborateur = (id: number, nom: string, prenom: string) => {
    setFormData({
      ...formData,
      collaborateurId: id
    });
    setSearchTerm(`${prenom} ${nom}`);
    setShowDropdown(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Validation de base
    if (!formData.collaborateurId || !formData.dateDebut || !formData.typeContrat || !formData.salaireBase) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Mettre à jour le contrat
      await contratService.update(id, formData);

      // Si un fichier est sélectionné, télécharger le document
      if (selectedFile) {
        await contratService.uploadDocument(id, selectedFile);
      }

      // Show success toast
      toast.success('Contrat mis à jour avec succès');

      // Rediriger vers la liste des contrats
      router.push('/protected/contrats');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      // Show error toast
      toast.error('Une erreur est survenue lors de la mise à jour du contrat. Veuillez réessayer.');
      setErrorMessage('Une erreur est survenue lors de la mise à jour du contrat. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options pour les listes déroulantes
  const typeContratOptions = [
    { value: '', label: 'Sélectionnez un type de contrat' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Intérim', label: 'Intérim' },
    { value: 'Stage', label: 'Stage' },
    { value: 'Freelance', label: 'Freelance' }
  ];

  const statusOptions = [
    { value: 'Actif', label: 'Actif' },
    { value: 'Expiré', label: 'Expiré' },
    { value: 'Résilié', label: 'Résilié' }
  ];

  const modeEnPaiementOptions = [
    { value: '', label: 'Sélectionner' },
    { value: 'Virement bancaire', label: 'Virement bancaire' },
    { value: 'Chèque', label: 'Chèque' },
    { value: 'Espèces', label: 'Espèces' }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Modification d{"'"}un Contrat</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex justify-center items-center">
          <p className="text-gray-700 dark:text-gray-300">Chargement des données...</p>
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
            onClick={() => router.push('/protected/contrats')}
            className="mr-4 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          Modifier le Contrat
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
                      onClick={() => handleSelectCollaborateur(collab.id, collab.nom, collab.prenom)}
                    >
                      <div className="h-8 w-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-200 mr-3">
                        {collab.prenom[0]}{collab.nom[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium dark:text-white">{collab.prenom} {collab.nom}</p>
                        {collab.poste && <p className="text-sm text-gray-500 dark:text-gray-300">{collab.poste}</p>}
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
          </div>
        </div>

        {/* Informations de base du contrat */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informations de Base du Contrat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="numeroContrat"
              label="Numéro de contrat"
              type="text"
              placeholder="Entrez le numéro de contrat"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.numeroContrat || ''}
              handleChange={handleChange}
              required
            />

            <InputGroup
              name="poste"
              label="Poste"
              type="text"
              placeholder="Entrez le poste"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.poste || ''}
              handleChange={handleChange}
              required
            />

            <Select
              label="Type de contrat"
              name="typeContrat"
              items={typeContratOptions}
              value={formData.typeContrat}
              onChange={handleChange}
              className="dark:bg-gray-700 dark:text-white"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date d{"'"}embauche
              </label>
              <input
                type="date"
                id="dateEmbauche"
                name="dateEmbauche"
                value={formData.dateEmbauche || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date de début du contrat
              </label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date de fin (si applicable)
              </label>
              <input
                type="date"
                id="dateFin"
                name="dateFin"
                value={formData.dateFin || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              />
            </div>

            <Select
              label="Statut du contrat"
              name="status"
              items={statusOptions}
              value={formData.status}
              onChange={handleChange}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Informations de rémunération */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Rémunération</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="salaireBase"
              label="Salaire de base (DH)"
              type="number"
              placeholder="Entrez le salaire de base"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.salaireBase?.toString() || ''}
              handleChange={handleChange}
              required
            />

            <InputGroup
              name="anciennete"
              label="Ancienneté (années)"
              type="number"
              placeholder="Entrez l'ancienneté"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.anciennete?.toString() || ''}
              handleChange={handleChange}
            />

            <Select
              label="Mode de paiement"
              name="modeEnPaiement"
              items={modeEnPaiementOptions}
              value={formData.modeEnPaiement || ''}
              onChange={handleChange}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Primes */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Primes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="primeTransport"
              label="Prime de transport (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.primeTransport?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="primePanier"
              label="Prime de panier (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.primePanier?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="primeRepresentation"
              label="Prime de représentation (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.primeRepresentation?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="primeResponsabilite"
              label="Prime de responsabilité (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.primeResponsabilite?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="autresPrimes"
              label="Autres primes (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.autresPrimes?.toString() || ''}
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* Indemnités */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Indemnités</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="indemnitesKilometriques"
              label="Indemnités kilométriques (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.indemnitesKilometriques?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="noteDeFrais"
              label="Note de frais (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.noteDeFrais?.toString() || ''}
              handleChange={handleChange}
            />

            <div className="md:col-span-3">
              <TextAreaGroup
                name="avantages"
                label="Avantages"
                placeholder="Décrivez les avantages"
                rows={3}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={formData.avantages || ''}
                handleChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Retenues */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Retenues</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="ir"
              label="IR (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.ir?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="cnss"
              label="CNSS (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.cnss?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="cimr"
              label="CIMR (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.cimr?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="mutuelle"
              label="Mutuelle (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.mutuelle?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="retraite"
              label="Retraite (DH)"
              type="number"
              placeholder="Entrez le montant"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.retraite?.toString() || ''}
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* Document du contrat */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Document du contrat</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Téléverser le document (PDF)
            </label>
            <div className="relative">
              <input
                type="file"
                id="documentContrat"
                name="documentContrat"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                accept=".pdf"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Fichier sélectionné: {selectedFile.name}
              </p>
            )}
            {currentDocumentUrl && !selectedFile && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Document actuel:
                </p>
                <a
                  href={currentDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Voir le document
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => router.push('/protected/contrats')}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isSubmitting ? 'Enregistrement...' : 'Mettre à jour le Contrat'}
          </Button>
        </div>
      </form>
    </div>
  );
}