"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import { Select } from "@/components/FormElements/select";
import { toast } from "sonner";

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

        setFormData(data);

        // Définir l'URL de la photo actuelle
        if (data.id) {
          setCurrentPhotoUrl(`http://3.67.202.103:8080/api/collaborateurs/${data.id}/photo`);
        }

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
      // Préparer les données à envoyer
      const collaborateurData: Collaborateur = {
        ...formData,
        photo: profilePhoto
      };

      // Envoyer les données au serveur
      await collaborateurService.update(id, collaborateurData);

      // Show success toast
      toast.success('Collaborateur mis à jour avec succès');

      // Rediriger vers la liste des collaborateurs
      router.push('/protected/collaborateurs');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour :', error);
      const errorMsg = error.response?.data?.message ||
        'Une erreur est survenue lors de la mise à jour du collaborateur. Veuillez réessayer.';
      // Show error toast
      toast.error(errorMsg);
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
    { value: 'Marié', label: 'Marié' },
    { value: 'Divorcé', label: 'Divorcé' }
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
                <Image
                  src={currentPhotoUrl || '/placeholder-profile.png'}
                  alt="Profile"
                  width={100} // Specify appropriate dimensions
                  height={100}
                  className="rounded-full object-cover"
                  onError={() => {
                    // Note: Next/Image handles errors differently
                    // This might not be needed with Next/Image
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

            {/* Select component for Sexe */}
            <Select
              name="sexe"
              label="Sexe"
              items={sexeOptions}
              value={formData.sexe}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white"
            />

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

            <Select
              name="status"
              label="Statut"
              items={statutOptions}
              value={formData.status}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white"
            />
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
            <Select
              name="situationFamiliale"
              label="Situation Familiale"
              items={situationFamilialeOptions}
              value={formData.situationFamiliale || ''}
              onChange={handleInputChange}
              placeholder="Choisir une situation"
              className="dark:bg-gray-700 dark:text-white"
            />
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
            <Select
              name="niveauQualification"
              label="Niveau de Qualification ou Diplôme Obtenu"
              items={niveauQualificationOptions}
              value={formData.niveauQualification || ''}
              onChange={handleInputChange}
              placeholder="Choisir un niveau"
              className="dark:bg-gray-700 dark:text-white"
            />
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



          </div>

          <div className="mt-4">
            <TextAreaGroup
              name="tachesAccomplies"
              label="Description"
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
            onClick={() => router.push('/protected/collaborateurs')}
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