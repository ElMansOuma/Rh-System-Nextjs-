"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';
import InputGroup from '@/components/FormElements/InputGroup';
import { TextAreaGroup } from '@/components/FormElements/InputGroup/text-area';
import { Select } from "@/components/FormElements/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Collaborateur>({
    prenom: '',
    nom: '',
    sexe: 'Homme',
    cin: '',
    dateNaissance: '',
    status: 'Actif',
    email: '',
    situationFamiliale: '',
    niveauQualification: '',
    situationEntreprise: '',
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Validation pour les champs numériques
    if (name === 'nombrePersonnesACharge' || name === 'nombreAnneeExperience') {
      const numValue = Number(value);

      // Vérifier si la valeur est négative
      if (numValue < 0) {
        setFormErrors(prev => ({
          ...prev,
          [name]: `La valeur pour ${name === 'nombrePersonnesACharge' ? 'personnes à charge' : 'années d\'expérience'} ne peut pas être négative`
        }));
        return;
      } else {
        // Effacer l'erreur si la valeur est valide
        setFormErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
        });
      }
    }

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

  // Validation avant soumission
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: {[key: string]: string} = {};

    // Validation pour les champs numériques
    if (formData.nombrePersonnesACharge !== undefined && formData.nombrePersonnesACharge < 0) {
      newErrors.nombrePersonnesACharge = "Le nombre de personnes à charge ne peut pas être négatif";
      isValid = false;
    }

    if (formData.nombreAnneeExperience !== undefined && formData.nombreAnneeExperience < 0) {
      newErrors.nombreAnneeExperience = "Le nombre d'années d'expérience ne peut pas être négatif";
      isValid = false;
    }

    // Validation de l'email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
      isValid = false;
    }

    // Validation de la date de naissance (pas dans le futur)
    if (formData.dateNaissance) {
      const birthDate = new Date(formData.dateNaissance);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateNaissance = "La date de naissance ne peut pas être dans le futur";
        isValid = false;
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Add Collaborator Form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Valider le formulaire avant soumission
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Préparer les données à envoyer
      const collaborateurData: Collaborateur = {
        ...formData,
        photo: profilePhoto
      };

      // Envoyer les données au serveur
      await collaborateurService.create(collaborateurData);

      // Show success toast
      toast.success('Collaborateur ajouté avec succès');

      // Rediriger vers la liste des collaborateurs
      router.push('/protected/collaborateurs');
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
      // Show error toast
      toast.error('Une erreur est survenue lors de l\'ajout du collaborateur. Veuillez réessayer.');
      setErrorMessage('Une erreur est survenue lors de l\'ajout du collaborateur. Veuillez réessayer.');
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

  // Fonction pour afficher une erreur sous un champ
  const renderError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      return (
        <p className="text-red-500 text-xs mt-1">{formErrors[fieldName]}</p>
      );
    }
    return null;
  };
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* En-tête de page */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          <Button
            variant="outline"
            onClick={() => router.push('/protected/collaborateurs')}
            className="mr-4 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          Ajouter un collaborateur
        </h1>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Information Personnelle avec photo à gauche */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informations Personnelles</h2>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Partie gauche - Photo */}
            <div className="w-full md:w-1/4 flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photoUpload"
              />
              <label
                htmlFor="photoUpload"
                className="w-40 h-40 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-gray-600 mb-3"
              >
                {profilePhoto ? (
                  <Image
                    src={URL.createObjectURL(profilePhoto)}
                    alt="Profile"
                    width={160}
                    height={160}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center text-sm px-4">
                    <div className="mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    Cliquez pour ajouter une photo
                  </div>
                )}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Photo du collaborateur
              </p>
            </div>

            {/* Partie droite - Informations de base */}
            <div className="w-full md:w-3/4">
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

                <Select
                  label="Sexe"
                  name="sexe"
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
                  {renderError('dateNaissance')}
                </div>

                <Select
                  label="Statut"
                  name="status"
                  items={statutOptions}
                  value={formData.status}
                  onChange={handleInputChange}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Coordonnées</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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
              {renderError('email')}
            </div>
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
              label="Situation Familiale"
              name="situationFamiliale"
              items={situationFamilialeOptions}
              value={formData.situationFamiliale || ''}
              placeholder="Choisir une situation"
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white"
            />
            <div>
              <InputGroup
                name="nombrePersonnesACharge"
                label="Nombre de Personnes à Charge (Enfants)"
                type="number"
                placeholder="Entrez le nombre"
                min="0"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={formData.nombrePersonnesACharge?.toString() || ''}
                handleChange={handleInputChange}
              />
              {renderError('nombrePersonnesACharge')}
            </div>

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
            <div>
              <InputGroup
                name="nombreAnneeExperience"
                label="Nombre d'Années d'Expérience"
                type="number"
                placeholder="Entrez le nombre d'années"
                min="0"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={formData.nombreAnneeExperience?.toString() || ''}
                handleChange={handleInputChange}
              />
              {renderError('nombreAnneeExperience')}
            </div>
            <Select
              label="Niveau de Qualification ou Diplôme Obtenu"
              name="niveauQualification"
              items={niveauQualificationOptions}
              value={formData.niveauQualification || ''}
              placeholder="Choisir un niveau"
              onChange={handleInputChange}
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
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Collaborateur'}
          </Button>
        </div>
      </form>
    </div>
  );
}