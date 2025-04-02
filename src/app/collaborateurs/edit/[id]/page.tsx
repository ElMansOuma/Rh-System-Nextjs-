"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import { Select } from "@/components/FormElements/select";

export default function EditCollaborateurPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Collaborateur>({
    prenom: '',
    nom: '',
    sexe: 'Homme',
    cin: '',
    dateNaissance: '',
    status: 'Actif',
    email: '',
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Charger les données du collaborateur au chargement de la page
  useEffect(() => {
    async function loadCollaborateur() {
      try {
        setIsLoading(true);
        const data = await collaborateurService.getById(id);

        // Formater la date de naissance et d'embauche pour l'input de type date
        if (data.dateNaissance) {
          data.dateNaissance = data.dateNaissance.split('T')[0];
        }
        if (data.dateEmbauche) {
          data.dateEmbauche = data.dateEmbauche.split('T')[0];
        }

        // Assurez-vous que toutes les valeurs sont définies pour éviter des problèmes avec les composants contrôlés
        setFormData({
          ...data,
          situationFamiliale: data.situationFamiliale || '',
          niveauQualification: data.niveauQualification || '',
          situationEntreprise: data.situationEntreprise || ''
        });

        // Définir l'URL de la photo actuelle
        if (data.id) {
          setCurrentPhotoUrl(`http://localhost:8080/api/collaborateurs/${data.id}/photo`);
        }

        console.log("Données chargées:", data); // Log pour débogage
        setErrorMessage(null);
      } catch (error) {
        console.error('Erreur lors du chargement du collaborateur:', error);
        setErrorMessage('Impossible de charger les informations du collaborateur. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadCollaborateur();
    }
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'situationFamiliale') {
      console.log(`Situation Familiale changed to: ${value}`);
    }
    console.log(`Changement de champ: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction mise à jour pour gérer directement les changements des Select personnalisés
  const handleSelectChange = (name: string, value: string) => {
    console.log(`Select personnalisé modifié: ${name} = ${value}`); // Log pour débogage
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      console.log("situationFamiliale à envoyer:", formData.situationFamiliale);

      // Préparer les données à envoyer
      const collaborateurData: Collaborateur = {
        ...formData,
        photo: profilePhoto
      };

      console.log("Données à envoyer:", collaborateurData); // Log pour débogage

      // Envoyer les données au serveur
      await collaborateurService.update(id, collaborateurData);

      // Rediriger vers la liste des collaborateurs
      router.push('/collaborateurs');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour :', error);
      const errorMsg = error.response?.data?.message ||
        'Une erreur est survenue lors de la mise à jour du collaborateur. Veuillez réessayer.';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define options for select components
  const sexeOptions = [
    { value: 'Homme', label: 'Homme' },
    { value: 'Femme', label: 'Femme' }
  ];

  const statutOptions = [
    { value: 'Actif', label: 'Actif' },
    { value: 'Inactif', label: 'Inactif' }
  ];

  const situationFamilialeOptions = [
    { value: '', label: 'Choisir une situation' },
    { value: 'Célibataire', label: 'Célibataire' },
    { value: 'Marié(e)', label: 'Marié(e)' },
    { value: 'Divorcé(e)', label: 'Divorcé(e)' }
  ];

  const niveauQualificationOptions = [
    { value: '', label: 'Choisir un niveau' },
    { value: 'Bac', label: 'Bac' },
    { value: 'Licence', label: 'Licence' },
    { value: 'Master', label: 'Master' },
    { value: 'Doctorat', label: 'Doctorat' }
  ];

  const situationEntrepriseOptions = [
    { value: '', label: 'Choisir une situation' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Freelance', label: 'Freelance' }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Modification d{"'"}un Collaborateur</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex justify-center items-center">
          <p className="text-gray-700 dark:text-gray-300">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Modifier le Collaborateur</h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photoUpload"
            />
            <label
              htmlFor="photoUpload"
              className="w-40 h-40 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {profilePhoto ? (
                <Image
                  src={URL.createObjectURL(profilePhoto)}
                  alt="Profile"
                  width={160}
                  height={160}
                  className="rounded-full object-cover"
                />
              ) : currentPhotoUrl ? (
                <img
                  src={currentPhotoUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-profile.png'; // Image de secours
                  }}
                />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center text-sm px-4">
                  <div className="mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  Cliquez pour parcourir ou glisser-déposer une photo
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Personal Base Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informations Personnelles de Base</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="matricule"
              label="Matricule"
              type="text"
              placeholder="Entrez le matricule"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.matricule || ''}
              handleChange={handleInputChange}
            />
            <InputGroup
              name="prenom"
              label="Prénom"
              type="text"
              placeholder="Entrez le prénom"
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.prenom}
              handleChange={handleInputChange}
            />
            <InputGroup
              name="nom"
              label="Nom"
              type="text"
              placeholder="Entrez le nom"
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.nom}
              handleChange={handleInputChange}
            />

            {/* Select component for Sexe - Modifié pour utiliser onChange */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexe</label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-gray-700 dark:text-white"
              >
                {sexeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <InputGroup
              name="cin"
              label="CIN"
              type="text"
              placeholder="Entrez le CIN"
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.cin}
              handleChange={handleInputChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Date de Naissance</label>
              <input
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              />
            </div>

            {/* Select component for Status - Modifié pour utiliser onChange */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-gray-700 dark:text-white"
              >
                {statutOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Coordonnées</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="email"
              label="Email"
              type="email"
              placeholder="Entrez l'email"
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.email}
              handleChange={handleInputChange}
            />
            <InputGroup
              name="telephone"
              label="Numéro de Téléphone"
              type="text"
              placeholder="Entrez le numéro de téléphone"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.telephone || ''}
              handleChange={handleInputChange}
            />
            <InputGroup
              name="electionDomicile"
              label="Election de Domicile"
              type="text"
              placeholder="Entrez l'élection de domicile"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.electionDomicile || ''}
              handleChange={handleInputChange}
            />
          </div>
        </div>

        {/* Family Situation */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Situation Familiale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Select component for Situation Familiale - Modifié pour utiliser onChange */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Situation Familiale</label>
              <select
                name="situationFamiliale"
                value={formData.situationFamiliale || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-gray-700 dark:text-white"
              >
                {situationFamilialeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <InputGroup
              name="nombrePersonnesACharge"
              label="Nombre de Personnes à Charge (Enfants)"
              type="number"
              placeholder="Entrez le nombre"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.nombrePersonnesACharge?.toString() || ''}
              handleChange={handleInputChange}
            />
            <InputGroup
              name="cnss"
              label="CNSS"
              type="text"
              placeholder="Entrez le numéro CNSS"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.cnss || ''}
              handleChange={handleInputChange}
            />
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Détails Professionnels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              name="nombreAnneeExperience"
              label="Nombre d'Années d'Expérience"
              type="number"
              placeholder="Entrez le nombre d'années"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.nombreAnneeExperience?.toString() || ''}
              handleChange={handleInputChange}
            />

            {/* Select component for Niveau de Qualification - Modifié pour utiliser onChange */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Niveau de Qualification ou Diplôme Obtenu</label>
              <select
                name="niveauQualification"
                value={formData.niveauQualification || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-gray-700 dark:text-white"
              >
                {niveauQualificationOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <InputGroup
              name="titrePosteOccupe"
              label="Titre du Poste Occupé"
              type="text"
              placeholder="Entrez le titre du poste"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.titrePosteOccupe || ''}
              handleChange={handleInputChange}
            />

            <InputGroup
              name="rib"
              label="RIB"
              type="text"
              placeholder="Entrez le RIB"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.rib || ''}
              handleChange={handleInputChange}
            />

            {/* Select component for Situation Entreprise - Modifié pour utiliser onChange */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Situation dans l'Entreprise</label>
              <select
                name="situationEntreprise"
                value={formData.situationEntreprise || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-gray-700 dark:text-white"
              >
                {situationEntrepriseOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Date d{"'"}Embauche</label>
              <input
                type="date"
                name="dateEmbauche"
                value={formData.dateEmbauche || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4">
            <TextAreaGroup
              name="tachesAccomplies"
              label="Tâches Accomplies"
              placeholder="Décrivez les tâches accomplies"
              rows={4}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.tachesAccomplies || ''}
              handleChange={handleInputChange}
            />
          </div>
        </div>
        {/* Submit Button */}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => router.push('/collaborateurs')}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isSubmitting ? 'Enregistrement...' : 'Mettre à jour le Collaborateur'}
          </Button>
        </div>
      </form>
    </div>
  );
}