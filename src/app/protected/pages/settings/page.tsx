"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AuthService from '@/services/authService';
import apiClient from '@/services/api';
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation'; // Ajouté pour la redirection

interface AdminData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

export default function SettingsPage() {
  const router = useRouter(); // Initialisation du router pour la redirection

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
  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: string, redirect?: boolean} | null>(null);

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

  // Fermer le toast automatiquement après 3 secondes et gérer la redirection si nécessaire
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        // Si le toast contient une instruction de redirection, rediriger après l'affichage du toast
        if (toastMessage.redirect) {
          AuthService.logout(); // Déconnexion explicite pour nettoyer la session
          router.push('/public/auth/sign-in'); // Redirection vers la page de connexion
        }
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, router]);

  const showToast = (title: string, message: string, type: string = "success", redirect: boolean = false) => {
    setToastMessage({ title, message, type, redirect });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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

      showToast("Profil mis à jour", "Vos informations ont été mises à jour avec succès.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil", error);
      showToast("Erreur", "Impossible de mettre à jour le profil. Veuillez réessayer.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("Erreur", "Les mots de passe ne correspondent pas.", "error");
      return;
    }

    setSaving(true);

    try {
      // Appel API pour mettre à jour le mot de passe
      await apiClient.put(`/admins/${adminData?.id}/password`, {
        currentPassword,
        newPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Afficher le toast de succès avec instruction de redirection
      showToast(
        "Mot de passe mis à jour",
        "Votre mot de passe a été changé avec succès. Vous allez être redirigé vers la page de connexion.",
        "success",
        true // Activer la redirection
      );
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe", error);
      showToast("Erreur", "Impossible de changer le mot de passe. Vérifiez votre mot de passe actuel.", "error");
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
          <XCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
          <div className="text-lg font-semibold mb-1">Session expirée</div>
          <div>Veuillez vous reconnecter</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto py-6 px-4 max-w-4xl transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Paramètres du compte</h1>
        <p className="text-gray-500">Gérez vos informations personnelles et préférences</p>
      </div>

      {/* Navigation par onglets personnalisée */}
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

      {/* Message Toast */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${toastMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          <div className="flex items-center">
            {toastMessage.type === 'error' ?
              <XCircle size={20} className="mr-2" /> :
              <CheckCircle size={20} className="mr-2" />
            }
            <div>
              <h4 className="font-semibold">{toastMessage.title}</h4>
              <p className="text-sm">{toastMessage.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Profil */}
      {activeTab === 'profile' && (
        <Card className="shadow-md border border-gray-100 transition-all duration-500 hover:shadow-lg">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <h2 className="flex items-center text-lg font-semibold">
              <User size={18} className="mr-2" />
              Informations personnelles
            </h2>
          </div>
          <CardContent className="pt-6">
            <form onSubmit={handleProfileUpdate} className={`space-y-4 transition-all duration-500 delay-100 ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-gray-700 flex items-center">
                  <User size={14} className="mr-2 text-blue-500" />
                  Nom complet
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-700 flex items-center">
                  <Mail size={14} className="mr-2 text-blue-500" />
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 flex items-center">
                  <Shield size={14} className="mr-2 text-blue-500" />
                  Rôle
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  {adminData.role} (non modifiable)
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                  disabled={saving}
                >
                  {saving ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Onglet Sécurité */}
      {activeTab === 'security' && (
        <Card className="shadow-md border border-gray-100 transition-all duration-500 hover:shadow-lg">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <h2 className="flex items-center text-lg font-semibold">
              <Lock size={18} className="mr-2" />
              Changer de mot de passe
            </h2>
          </div>
          <CardContent className="pt-6">
            <form onSubmit={handlePasswordChange} className={`space-y-4 transition-all duration-500 delay-100 ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-gray-700">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
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
                <label htmlFor="newPassword" className="block text-gray-700">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-gray-700">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                >
                  {saving ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}