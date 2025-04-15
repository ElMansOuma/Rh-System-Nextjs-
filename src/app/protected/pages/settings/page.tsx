"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthService from '@/services/authService';
import apiClient from '@/services/api';
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

export default function SettingsPage() {
  const router = useRouter();

  // States pour les données utilisateur
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [animate, setAnimate] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("profile");

  // États du formulaire
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = AuthService.getCurrentUser();
        if (userData) {
          setAdminData({
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
            active: userData.active
          });

          // Initialisation des champs du formulaire
          setFullName(userData.fullName);
          setEmail(userData.email);
        }
        setLoading(false);

        // Démarrer l'animation après le chargement des données
        setTimeout(() => setAnimate(true), 100);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      // Appel API pour mettre à jour le profil
      const response = await apiClient.put(`/admins/${adminData?.id}`, {
        fullName,
        email
      });

      // Mettre à jour le localStorage avec les nouvelles données
      const currentUser = AuthService.getCurrentUser();
      const updatedUser = { ...currentUser, fullName, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Mettre à jour l'état
      setAdminData({
        ...adminData!,
        fullName,
        email
      });

      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil", error);
      setErrorMessage("Impossible de mettre à jour le profil. Veuillez réessayer.");
      toast.error("Impossible de mettre à jour le profil");
    } finally {
      setSaving(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return false;
    }

    if (!currentPassword.trim()) {
      setErrorMessage("Veuillez saisir votre mot de passe actuel.");
      return false;
    }

    return true;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      // Appel API pour mettre à jour le mot de passe
      await apiClient.put(`/admins/${adminData?.id}/password`, {
        currentPassword,
        newPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success(
        "Mot de passe mis à jour avec succès. Vous allez être redirigé vers la page de connexion."
      );

      // Déconnexion et redirection après 3 secondes
      setTimeout(() => {
        AuthService.logout();
        router.push('/public/auth/sign-in');
      }, 3000);
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe", error);
      setErrorMessage("Impossible de changer le mot de passe. Vérifiez votre mot de passe actuel.");
      toast.error("Échec de la mise à jour du mot de passe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center text-gray-500">
          <div className="w-10 h-10 border-3 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-3"></div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200 text-red-700 max-w-sm">
          <div className="text-lg font-semibold mb-1">Session expirée</div>
          <div>Veuillez vous reconnecter</div>
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
            onClick={() => router.push('/dashboard')}
            className="mr-4 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          Paramètres du compte
        </h1>
      </div>

      {/* Navigation par onglets */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 flex items-center ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} className="mr-2" />
          Profil
        </button>
        <button
          className={`px-4 py-2 flex items-center ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={16} className="mr-2" />
          Sécurité
        </button>
      </div>

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* Onglet Profil */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <User size={18} className="mr-2 text-blue-500" />
            Informations personnelles
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <User size={14} className="mr-2 text-blue-500" />
                Nom complet
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Mail size={14} className="mr-2 text-blue-500" />
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Shield size={14} className="mr-2 text-blue-500" />
                Rôle
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                {adminData.role} (non modifiable)
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Onglet Sécurité */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <Lock size={18} className="mr-2 text-blue-500" />
            Changer de mot de passe
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Mot de passe actuel*
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Nouveau mot de passe*
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Confirmer le nouveau mot de passe*
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white pr-10"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Mettre à jour le mot de passe
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}