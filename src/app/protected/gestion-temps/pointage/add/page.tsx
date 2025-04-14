"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, X, Save } from 'lucide-react';
import { toast } from "sonner";
import timeRecordService, { TimeRecordDTO } from '@/services/timeRecordService';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';

export default function AddPointagePage() {
  const router = useRouter();

  // État pour le formulaire
  const [formData, setFormData] = useState<TimeRecordDTO>({
    collaborateurId: 0,
    date: new Date().toISOString().split('T')[0],
    heureEntree: '',
    heureSortie: '',
    statut: 'Présent',
    justification: '',
    totalHeures: 0
  });

  // État pour la liste des collaborateurs
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCollabs, setLoadingCollabs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger la liste des collaborateurs
  useEffect(() => {
    const fetchCollaborateurs = async () => {
      try {
        setLoadingCollabs(true);
        const data = await collaborateurService.getAll();
        setCollaborateurs(data);
        setLoadingCollabs(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des collaborateurs:', err);
        if (err.response && err.response.status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          toast.error("Impossible de charger la liste des collaborateurs");
        }
        setLoadingCollabs(false);
      }
    };

    fetchCollaborateurs();
  }, [router]);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculer les heures totales automatiquement
  useEffect(() => {
    if (formData.heureEntree && formData.heureSortie) {
      const [entreeHours, entreeMinutes] = formData.heureEntree.split(':').map(Number);
      const [sortieHours, sortieMinutes] = formData.heureSortie.split(':').map(Number);

      // Convertir en minutes
      const entreeTotal = entreeHours * 60 + entreeMinutes;
      const sortieTotal = sortieHours * 60 + sortieMinutes;

      // Calculer la différence en heures (avec 2 décimales)
      const totalHeures = sortieTotal > entreeTotal ?
        Number(((sortieTotal - entreeTotal) / 60).toFixed(2)) : 0;

      setFormData(prev => ({
        ...prev,
        totalHeures
      }));
    }
  }, [formData.heureEntree, formData.heureSortie]);

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.collaborateurId || formData.collaborateurId === 0) {
      toast.error("Veuillez sélectionner un collaborateur");
      return;
    }

    if (!formData.date) {
      toast.error("Veuillez sélectionner une date");
      return;
    }

    if (!formData.heureEntree || !formData.heureSortie) {
      toast.error("Veuillez spécifier les heures d'entrée et de sortie");
      return;
    }

    if (formData.statut === 'Absent' && !formData.justification) {
      toast.error("Veuillez fournir une justification pour l'absence");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await timeRecordService.create(formData);

      toast.success("Pointage créé avec succès");
      router.push('/protected/gestion-temps/pointage');
    } catch (err: any) {
      console.error('Erreur lors de la création du pointage:', err);
      if (err.response && err.response.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError("Erreur lors de la création du pointage");
        toast.error("Erreur lors de la création du pointage");
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nouveau Pointage</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/protected/gestion-temps/pointage')}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du collaborateur */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Collaborateur *
              </label>
              {loadingCollabs ? (
                <div className="text-gray-500 dark:text-gray-400">Chargement des collaborateurs...</div>
              ) : (
                <select
                  name="collaborateurId"
                  value={formData.collaborateurId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Sélectionner un collaborateur</option>
                  {collaborateurs.map((collab) => (
                    <option key={collab.id} value={collab.id}>
                      {collab.nom} {collab.prenom} - {collab.matricule || 'Sans matricule'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date *
              </label>
              <div className="relative">
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Heures d'entrée et de sortie */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heure d{"'"}entrée *
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    name="heureEntree"
                    value={formData.heureEntree}
                    onChange={handleChange}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heure de sortie *
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    name="heureSortie"
                    value={formData.heureSortie}
                    onChange={handleChange}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total d{"'"}heures
                </label>
                <Input
                  type="text"
                  value={formData.totalHeures !== undefined ? `${formData.totalHeures} heure(s)` : ''}
                  disabled
                  className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut *
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="Présent">Présent</option>
                <option value="Retard">Retard</option>
                <option value="Absent">Absent</option>
                <option value="Congé">Congé</option>
                <option value="Mission">Mission</option>
              </select>
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Justification {formData.statut === 'Absent' && '*'}
              </label>
              <textarea
                name="justification"
                value={formData.justification || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Entrez une justification..."
                required={formData.statut === 'Absent'}
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur ! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/protected/gestion-temps/pointage')}
                className="dark:border-gray-700 dark:text-gray-300"
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}