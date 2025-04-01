"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';

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
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      await collaborateurService.create(collaborateurData);

      // Rediriger vers la liste des collaborateurs
      router.push('/collaborateurs');
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
      setErrorMessage('Une erreur est survenue lors de l\'ajout du collaborateur. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Ajouter un Collaborateur</h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-6">
            <div className="w-40 h-40 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {profilePhoto ? (
                <Image
                  src={URL.createObjectURL(profilePhoto)}
                  alt="Profile"
                  width={160}
                  height={160}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-center text-sm">
                  Glisser & Déposer la photo de profile ou Parcourir
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photoUpload"
            />
            <label
              htmlFor="photoUpload"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-white"
            >
              Parcourir
            </label>
          </div>
        </div>

        {/* Le reste du formulaire reste inchangé, seuls les gestionnaires d'événements ont été modifiés */}
        {/* ... (conservez les sections existantes du formulaire) ... */}

        {/* Personal Base Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informations Personnelles de Base</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="matricule"
              label="Matricule"
              value={formData.matricule || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Input
              name="prenom"
              label="Prénom"
              required
              value={formData.prenom}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Input
              name="nom"
              label="Nom"
              required
              value={formData.nom}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sexe</label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
              >
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            <Input
              name="cin"
              label="CIN"
              required
              value={formData.cin}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />

            <Input
              name="dateNaissance"
              label="Date de Naissance"
              type="date"
              required
              value={formData.dateNaissance}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Coordonnées</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="email"
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Input
              name="telephone"
              label="Numéro de Téléphone"
              value={formData.telephone || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Input
              name="electionDomicile"
              label="Election de Domicile"
              value={formData.electionDomicile || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {/* Family Situation */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Situation Familiale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Situation Familiale</label>
              <select
                name="situationFamiliale"
                value={formData.situationFamiliale || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choisir une situation</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
              </select>
            </div>
            <Input
              name="nombrePersonnesACharge"
              label="Nombre de Personnes à Charge (Enfants)"
              type="number"
              value={formData.nombrePersonnesACharge?.toString() || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Input
              name="cnss"
              label="CNSS"
              value={formData.cnss || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Détails Professionnels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="nombreAnneeExperience"
              label="Nombre d'Années d'Expérience"
              type="number"
              value={formData.nombreAnneeExperience?.toString() || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Niveau de Qualification ou Diplôme Obtenu</label>
              <select
                name="niveauQualification"
                value={formData.niveauQualification || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choisir un niveau</option>
                <option value="Bac">Bac</option>
                <option value="Licence">Licence</option>
                <option value="Master">Master</option>
                <option value="Doctorat">Doctorat</option>
              </select>
            </div>
            <Input
              name="titrePosteOccupe"
              label="Titre du Poste Occupé"
              value={formData.titrePosteOccupe || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />

            <Input
              name="rib"
              label="RIB"
              value={formData.rib || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />

            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Situation dans l'Entreprise</label>
=======
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Situation dans l{"'"}Entreprise</label>
>>>>>>> cf0ce64 (Initial commit)
              <select
                name="situationEntreprise"
                value={formData.situationEntreprise || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choisir une situation</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <Input
              name="dateEmbauche"
              label="Date d'Embauche"
              type="date"
              value={formData.dateEmbauche || ''}
              onChange={handleInputChange}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tâches Accomplies</label>
            <textarea
              name="tachesAccomplies"
              value={formData.tachesAccomplies || ''}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
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