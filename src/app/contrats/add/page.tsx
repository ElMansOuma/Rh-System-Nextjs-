'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contrat } from '@/types/Contrat';
import contratService from '@/services/contratService';
import collaborateurService from '@/services/collaborateurService';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import { Select } from "@/components/FormElements/select";

export default function AddContratPage() {
  const router = useRouter();
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [filteredCollaborateurs, setFilteredCollaborateurs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Charger la liste des collaborateurs pour le dropdown
    const fetchCollaborateurs = async () => {
      try {
        const data = await collaborateurService.getAll();
        setCollaborateurs(data);
        setFilteredCollaborateurs(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des collaborateurs:', error);
        setError('Impossible de charger la liste des collaborateurs.');
      }
    };

    fetchCollaborateurs();
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

    // Validation de base
    if (!formData.collaborateurId || !formData.dateDebut || !formData.typeContrat || !formData.salaireBase) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Créer le contrat
      const createdContrat = await contratService.create(formData);

      // Si un fichier est sélectionné, télécharger le document
      if (selectedFile && createdContrat.id) {
        await contratService.uploadDocument(createdContrat.id, selectedFile);
      }

      setSuccess(true);

      // Rediriger vers la liste des contrats après 2 secondes
      setTimeout(() => {
        router.push('/contrats');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      setError('Une erreur est survenue lors de la création du contrat.');
    } finally {
      setLoading(false);
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

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ajouter un nouveau contrat</h1>
        <div className="mt-2">
          <Link href="/contrats" className="text-blue-500 hover:text-blue-700">
            &larr; Retour à la liste des contrats
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Contrat créé avec succès! Redirection en cours...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informations de base */}
          <InputGroup
            name="numeroContrat"
            label="Numéro de contrat"
            type="text"
            placeholder="Entrez le numéro de contrat"
            value={formData.numeroContrat || ''}
            handleChange={handleChange}
            required
          />

          <div className="mb-4 relative" ref={dropdownRef}>
            <label className="block text-body-sm font-medium text-dark dark:text-white mb-3">
              Collaborateur
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un collaborateur..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 pl-11"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {showDropdown && filteredCollaborateurs.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                  {filteredCollaborateurs.map((collab) => (
                    <div
                      key={collab.id}
                      className="cursor-pointer hover:bg-blue-50 py-2 px-4 transition-colors duration-200 ease-in-out flex items-center"
                      onClick={() => handleSelectCollaborateur(collab.id, collab.nom, collab.prenom)}
                    >
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                        {collab.prenom[0]}{collab.nom[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{collab.prenom} {collab.nom}</p>
                        {collab.poste && <p className="text-sm text-gray-500">{collab.poste}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDropdown && searchTerm && filteredCollaborateurs.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-4 text-center text-gray-500">
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

          <InputGroup
            name="poste"
            label="Poste"
            type="text"
            placeholder="Entrez le poste"
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
          />

          <div className="mb-4">
            <label className="block text-body-sm font-medium text-dark dark:text-white mb-3">
              Date d'embauche
            </label>
            <input
              type="date"
              id="dateEmbauche"
              name="dateEmbauche"
              value={formData.dateEmbauche || ''}
              onChange={handleChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-body-sm font-medium text-dark dark:text-white mb-3">
              Date de début du contrat
            </label>
            <input
              type="date"
              id="dateDebut"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-body-sm font-medium text-dark dark:text-white mb-3">
              Date de fin (si applicable)
            </label>
            <input
              type="date"
              id="dateFin"
              name="dateFin"
              value={formData.dateFin || ''}
              onChange={handleChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <InputGroup
            name="salaireBase"
            label="Salaire de base (DH)"
            type="number"
            placeholder="Entrez le salaire de base"
            value={formData.salaireBase?.toString() || ''}
            handleChange={handleChange}
            required
          />

          <InputGroup
            name="anciennete"
            label="Ancienneté (années)"
            type="number"
            placeholder="Entrez l'ancienneté"
            value={formData.anciennete?.toString() || ''}
            handleChange={handleChange}
          />

          <Select
            label="Mode de paiement"
            name="modeEnPaiement"
            items={modeEnPaiementOptions}
            value={formData.modeEnPaiement || ''}
            onChange={handleChange}
          />

          <Select
            label="Statut du contrat"
            name="status"
            items={statusOptions}
            value={formData.status}
            onChange={handleChange}
          />
        </div>

        {/* Primes */}
        <div className="mt-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Primes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="primeTransport"
              label="Prime de transport (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.primeTransport?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="primePanier"
              label="Prime de panier (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.primePanier?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="primeRepresentation"
              label="Prime de représentation (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.primeRepresentation?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="primeResponsabilite"
              label="Prime de responsabilité (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.primeResponsabilite?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="autresPrimes"
              label="Autres primes (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.autresPrimes?.toString() || ''}
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* Indemnités */}
        <div className="mt-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Indemnités</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="indemnitesKilometriques"
              label="Indemnités kilométriques (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.indemnitesKilometriques?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="noteDeFrais"
              label="Note de frais (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.noteDeFrais?.toString() || ''}
              handleChange={handleChange}
            />

            <div className="md:col-span-3">
              <TextAreaGroup
                name="avantages"
                label="Avantages"
                placeholder="Décrivez les avantages"
                rows={3}
                value={formData.avantages || ''}
                handleChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Retenues */}
        <div className="mt-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Retenues</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="ir"
              label="IR (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.ir?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="cnss"
              label="CNSS (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.cnss?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="cimr"
              label="CIMR (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.cimr?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="mutuelle"
              label="Mutuelle (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.mutuelle?.toString() || ''}
              handleChange={handleChange}
            />

            <InputGroup
              name="retraite"
              label="Retraite (DH)"
              type="number"
              placeholder="Entrez le montant"
              value={formData.retraite?.toString() || ''}
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* Document */}
        <div className="mt-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Document du contrat</h2>
          <div className="mb-4">
            <label className="block text-body-sm font-medium text-dark dark:text-white mb-3">
              Téléverser le document (PDF)
            </label>
            <div className="relative">
              <input
                type="file"
                id="documentContrat"
                name="documentContrat"
                onChange={handleFileChange}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                accept=".pdf"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Fichier sélectionné: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </span>
            ) : (
              'Créer le contrat'
            )}
          </button>
          <Link
            href="/contrats"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}