"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, X, Save } from 'lucide-react';
import { toast } from "sonner";
import timeRecordService, { TimeRecordDTO } from '@/services/timeRecordService';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';

export default function EditPointagePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pointageId = parseInt(params.id);

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
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du pointage et la liste des collaborateurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les collaborateurs
        const collabData = await collaborateurService.getAll();
        setCollaborateurs(collabData);

        // Charger les données du pointage
        const pointageData = await timeRecordService.getById(pointageId);
        setFormData(pointageData);

        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des données:', err);
        if (err.response && err.response.status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setError("Impossible de charger les données. Veuillez réessayer plus tard.");
          toast.error("Erreur lors du chargement des données");
        }
        setLoading(false);
      }
    };

    if (pointageId) {
      fetchData();
    }
  }, [pointageId, router]);

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
      setSaveLoading(true);
      setError(null);

      await timeRecordService.update(pointageId, formData);

      toast.success("Pointage mis à jour avec succès");
      router.push('/protected/gestion-temps/pointage');
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du pointage:', err);
      if (err.response && err.response.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError("Erreur lors de la mise à jour du pointage");
        toast.error("Erreur lors de la mise à jour du pointage");
      }
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Chargement des données...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Modifier le Pointage</h1>
          <Button
            variant="default"
            onClick={() => router.push('/protected/gestion-temps/pointage')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du collaborateur */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Collaborateur *
              </label>
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
                    {collab.nom} {collab.prenom} {collab.matricule ? `- ${collab.matricule}` : ''}
                  </option>
                ))}
              </select>
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
                  Heure d'entrée *
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    name="heureEntree"
                    value={formData.heureEntree || ''}
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
                    value={formData.heureSortie || ''}
                    onChange={handleChange}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total d'heures
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
                variant="default"
                onClick={() => router.push('/protected/gestion-temps/pointage')}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                disabled={saveLoading}
              >
                <X className="mr-2 h-5 w-5" />
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white"
                disabled={saveLoading}
              >
                <Save className="mr-2 h-5 w-5" />
                {saveLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}