"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, X, Save, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import retardService, { RetardDTO } from '@/services/retardService';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';

export default function AddRetardPage() {
  const router = useRouter();

  // État pour le formulaire
  const [formData, setFormData] = useState<RetardDTO>({
    collaborateurId: 0,
    date: new Date().toISOString().split('T')[0],
    heureArrivee: '',
    heurePrevu: '09:00',
    dureeRetard: 0,
    statut: 'Non traité',
    justification: '',
    remarques: ''
  });

  // État pour la liste des collaborateurs
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCollabs, setLoadingCollabs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger la liste des collaborateurs"use client";
  // import React, { useState, useEffect } from 'react';
  // import { useRouter } from 'next/navigation';
  // import { Button } from '@/components/ui/button';
  // import { Input } from '@/components/ui/input';
  // import { Calendar as CalendarIcon, Clock, X, Save, AlertCircle } from 'lucide-react';
  // import { toast } from "sonner";
  // import retardService, { RetardDTO } from '@/services/retardService';
  // import collaborateurService, { Collaborateur } from '@/services/collaborateurService';
  //
  // export default function AddRetardPage() {
  //   const router = useRouter();
  //
  //   // État pour le formulaire
  //   const [formData, setFormData] = useState<RetardDTO>({
  //     collaborateurId: 0,
  //     date: new Date().toISOString().split('T')[0],
  //     heureArrivee: '',
  //     heurePrevu: '09:00',
  //     dureeRetard: 0,
  //     statut: 'Non traité',
  //     justification: '',
  //     remarques: ''
  //   });
  //
  //   // État pour la liste des collaborateurs
  //   const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  //   const [loading, setLoading] = useState<boolean>(false);
  //   const [loadingCollabs, setLoadingCollabs] = useState<boolean>(true);
  //   const [error, setError] = useState<string | null>(null);
  //
  //   // Charger la liste des collaborateurs
  //   useEffect(() => {
  //     const fetchCollaborateurs = async () => {
  //       try {
  //         setLoadingCollabs(true);
  //         const data = await collaborateurService.getAll();
  //         setCollaborateurs(data);
  //         setLoadingCollabs(false);
  //       } catch (err: any) {
  //         console.error('Erreur lors du chargement des collaborateurs:', err);
  //         if (err.response && err.response.status === 401) {
  //           toast.error("Session expirée. Veuillez vous reconnecter.");
  //           setTimeout(() => {
  //             router.push('/login');
  //           }, 2000);
  //         } else {
  //           toast.error("Impossible de charger la liste des collaborateurs");
  //         }
  //         setLoadingCollabs(false);
  //       }
  //     };
  //
  //     fetchCollaborateurs();
  //   }, [router]);
  //
  //   // Gérer les changements dans le formulaire
  //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  //     const { name, value } = e.target;
  //     setFormData(prev => ({ ...prev, [name]: value }));
  //   };
  //
  //   // Calculer la durée du retard automatiquement
  //   useEffect(() => {
  //     if (formData.heureArrivee && formData.heurePrevu) {
  //       const [prevuHours, prevuMinutes] = formData.heurePrevu.split(':').map(Number);
  //       const [arriveeHours, arriveeMinutes] = formData.heureArrivee.split(':').map(Number);
  //
  //       // Convertir en minutes
  //       const prevuTotal = prevuHours * 60 + prevuMinutes;
  //       const arriveeTotal = arriveeHours * 60 + arriveeMinutes;
  //
  //       // Calculer la différence en minutes
  //       const dureeRetard = arriveeTotal > prevuTotal ?
  //         arriveeTotal - prevuTotal : 0;
  //
  //       setFormData(prev => ({
  //         ...prev,
  //         dureeRetard
  //       }));
  //     }
  //   }, [formData.heureArrivee, formData.heurePrevu]);
  //
  //   // Formatage de la durée en heures et minutes
  //   const formatDuree = (minutes: number) => {
  //     const heures = Math.floor(minutes / 60);
  //     const mins = minutes % 60;
  //     return `${heures}h ${mins}min`;
  //   };
  //
  //   // Soumettre le formulaire
  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //
  //     if (!formData.collaborateurId || formData.collaborateurId === 0) {
  //       toast.error("Veuillez sélectionner un collaborateur");
  //       return;
  //     }
  //
  //     if (!formData.date) {
  //       toast.error("Veuillez sélectionner une date");
  //       return;
  //     }
  //
  //     if (!formData.heureArrivee) {
  //       toast.error("Veuillez spécifier l'heure d'arrivée");
  //       return;
  //     }
  //
  //     if (formData.dureeRetard <= 0) {
  //       toast.error("La durée du retard doit être positive");
  //       return;
  //     }
  //
  //     if (!formData.justification) {
  //       toast.error("Veuillez fournir une justification pour le retard");
  //       return;
  //     }
  //
  //     try {
  //       setLoading(true);
  //       setError(null);
  //
  //       await retardService.create(formData);
  //
  //       toast.success("Retard enregistré avec succès");
  //       router.push('/protected/gestion-temps/retard');
  //     } catch (err: any) {
  //       console.error('Erreur lors de l\'enregistrement du retard:', err);
  //       if (err.response && err.response.status === 401) {
  //         toast.error("Session expirée. Veuillez vous reconnecter.");
  //         setTimeout(() => {
  //           router.push('/login');
  //         }, 2000);
  //       } else {
  //         setError("Erreur lors de l'enregistrement du retard");
  //         toast.error("Erreur lors de l'enregistrement du retard");
  //       }
  //       setLoading(false);
  //     }
  //   };
  //
  //   return (
  //     <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
  //       <div className="max-w-4xl mx-auto">
  //         <div className="flex justify-between items-center mb-6">
  //           <h1 className="text-2xl font-bold">Nouveau Retard</h1>
  //           <Button
  //             variant="outline"
  //             onClick={() => router.push('/protected/gestion-temps/retard')}
  //             className="dark:border-gray-700 dark:text-gray-300"
  //           >
  //             <X className="mr-2 h-4 w-4" />
  //             Annuler
  //           </Button>
  //         </div>
  //
  //         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
  //           <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded">
  //             <div className="flex items-start">
  //               <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
  //               <div>
  //                 <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
  //                   Rappel des règles de retard
  //                 </p>
  //                 <ul className="mt-1 text-xs text-amber-700 dark:text-amber-300 list-disc pl-5 space-y-1">
  //                   <li>Un retard est considéré à partir de 09:30</li>
  //                   <li>Trois retards dans le mois déclenchent un avertissement</li>
  //                   <li>Une justification valide est obligatoire</li>
  //                   <li>Les retards pour cause de transport en commun doivent être accompagnés d'un justificatif</li>
  //                 </ul>
  //               </div>
  //             </div>
  //           </div>
  //
  //           <form onSubmit={handleSubmit} className="space-y-6">
  //             {/* Sélection du collaborateur */}
  //             <div className="space-y-2">
  //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
  //                 Collaborateur *
  //               </label>
  //               {loadingCollabs ? (
  //                 <div className="text-gray-500 dark:text-gray-400">Chargement des collaborateurs...</div>
  //               ) : (
  //                 <select
  //                   name="collaborateurId"
  //                   value={formData.collaborateurId}
  //                   onChange={handleChange}
  //                   className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  //                   required
  //                 >
  //                   <option value="">Sélectionner un collaborateur</option>
  //                   {collaborateurs.map((collab) => (
  //                     <option key={collab.id} value={collab.id}>
  //                       {collab.nom} {collab.prenom} - {collab.matricule || 'Sans matricule'}
  //                     </option>
  //                   ))}
  //                 </select>
  //               )}
  //             </div>
  //
  //             {/* Date */}
  //             <div className="space-y-2">
  //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
  //                 Date du retard *
  //               </label>
  //               <div className="relative">
  //                 <Input
  //                   type="date"
  //                   name="date"
  //                   value={formData.date}
  //                   onChange={handleChange}
  //                   className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  //                   required
  //                 />
  //                 <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
  //               </div>
  //             </div>
  //
  //             {/* Heures */}
  //             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //               <div className="space-y-2">
  //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
  //                   Heure prévue d'arrivée *
  //                 </label>
  //                 <div className="relative">
  //                   <Input
  //                     type="time"
  //                     name="heurePrevu"
  //                     value={formData.heurePrevu}
  //                     onChange={handleChange}
  //                     className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  //                     required
  //                   />
  //                   <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
  //                 </div>
  //               </div>
  //
  //               <div className="space-y-2">
  //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
  //                   Heure réelle d'arrivée *
  //                 </label>
  //                 <div className="relative">
  //                   <Input
  //                     type="time"
  //                     name="heureArrivee"
  //                     value={formData.heureArrivee}
  //                     onChange={handleChange}
  //                     className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  //                     required
  //                   />
  //                   <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
  //                 </div>
  //               </div>
  //
  //               <div className="space-y-2">
  //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
  //                   Durée du retard
  //                 </label>
  //                 <Input
  //                   type="text"
  //                   value={formData.dureeRetard ? formatDuree(formData.dureeRetard) : ''}
  //                   disabled
  //                   className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  //                 />
  //               </div>
  //             </div>
  //
  //             {/* Statut */}
  //             <div className="space-y-2">
  //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
  //                 Statut du retard *
  //               </label>
  //               <select
  //                 name="statut"
  //                 value={formData.statut}
  //                 onChange={handleChange}
  //                 className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  //                 required
  //               >
  //                 <option value="Non traité">Non traité</option>
  //                 <option value="Validé">Validé</option>
  //                 <option value="Refusé">Refusé</option>
  //                 <option value="En attente de justificatif">En attente de justificatif</option>
  //               </select>
  //             </div>
  //
  //             {/* Justification */}
  //             <div className="space-y-2">
  //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
  //                 Justification *
  //               </label>
  //               <textarea
  //                 name="justification"
  //                 value={formData.justification || ''}
  //                 onChange={handleChange}
  //                 className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  //                 placeholder="Entrez une justification pour le retard..."
  //                 required
  //               />
  //             </div>
  //
  //             {/* Remarques */}
  //             <div className="space-y-2">
  //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
  //                 Remarques additionnelles
  //               </label>
  //               <textarea
  //                 name="remarques"
  //                 value={formData.remarques || ''}
  //                 onChange={handleChange}
  //                 className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  //                 placeholder="Remarques additionnelles (facultatif)..."
  //               />
  //             </div>
  //
  //             {/* Message d'erreur */}
  //             {error && (
  //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
  //                 <strong className="font-bold">Erreur ! </strong>
  //                 <span className="block sm:inline">{error}</span>
  //               </div>
  //             )}
  //
  //             {/* Boutons d'action */}
  //             <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
  //               <Button
  //                 type="button"
  //                 variant="outline"
  //                 onClick={() => router.push('/protected/gestion-temps/retard')}
  //                 className="dark:border-gray-700 dark:text-gray-300"
  //                 disabled={loading}
  //               >
  //                 Annuler
  //               </Button>
  //               <Button
  //                 type="submit"
  //                 className="bg-yellow-500 hover:bg-yellow-600 text-white"
  //                 disabled={loading}
  //               >
  //                 <Save className="mr-2 h-4 w-4" />
  //                 {loading ? 'Enregistrement...' : 'Enregistrer'}
  //               </Button>
  //             </div>
  //           </form>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
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

  // Calculer la durée du retard automatiquement
  useEffect(() => {
    if (formData.heureArrivee && formData.heurePrevu) {
      const [prevuHours, prevuMinutes] = formData.heurePrevu.split(':').map(Number);
      const [arriveeHours, arriveeMinutes] = formData.heureArrivee.split(':').map(Number);

      // Convertir en minutes
      const prevuTotal = prevuHours * 60 + prevuMinutes;
      const arriveeTotal = arriveeHours * 60 + arriveeMinutes;

      // Calculer la différence en minutes
      const dureeRetard = arriveeTotal > prevuTotal ?
        arriveeTotal - prevuTotal : 0;

      setFormData(prev => ({
        ...prev,
        dureeRetard
      }));
    }
  }, [formData.heureArrivee, formData.heurePrevu]);

  // Formatage de la durée en heures et minutes
  const formatDuree = (minutes: number) => {
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${heures}h ${mins}min`;
  };

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

    if (!formData.heureArrivee) {
      toast.error("Veuillez spécifier l'heure d'arrivée");
      return;
    }

    if (formData.dureeRetard <= 0) {
      toast.error("La durée du retard doit être positive");
      return;
    }

    if (!formData.justification) {
      toast.error("Veuillez fournir une justification pour le retard");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await retardService.create(formData);

      toast.success("Retard enregistré avec succès");
      router.push('/protected/gestion-temps/retard');
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement du retard:', err);
      if (err.response && err.response.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError("Erreur lors de l'enregistrement du retard");
        toast.error("Erreur lors de l'enregistrement du retard");
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nouveau Retard</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/protected/gestion-temps/retard')}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  Rappel des règles de retard
                </p>
                <ul className="mt-1 text-xs text-amber-700 dark:text-amber-300 list-disc pl-5 space-y-1">
                  <li>Un retard est considéré à partir de 09:30</li>
                  <li>Trois retards dans le mois déclenchent un avertissement</li>
                  <li>Une justification valide est obligatoire</li>
                  <li>Les retards pour cause de transport en commun doivent être accompagnés d{"'"}un justificatif</li>
                </ul>
              </div>
            </div>
          </div>

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
                Date du retard *
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

            {/* Heures */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heure prévue d{"'"}arrivée *
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    name="heurePrevu"
                    value={formData.heurePrevu}
                    onChange={handleChange}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heure réelle d{"'"}arrivée *
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    name="heureArrivee"
                    value={formData.heureArrivee}
                    onChange={handleChange}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Durée du retard
                </label>
                <Input
                  type="text"
                  value={formData.dureeRetard ? formatDuree(formData.dureeRetard) : ''}
                  disabled
                  className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut du retard *
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="Non traité">Non traité</option>
                <option value="Validé">Validé</option>
                <option value="Refusé">Refusé</option>
                <option value="En attente de justificatif">En attente de justificatif</option>
              </select>
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Justification *
              </label>
              <textarea
                name="justification"
                value={formData.justification || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Entrez une justification pour le retard..."
                required
              />
            </div>

            {/* Remarques */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Remarques additionnelles
              </label>
              <textarea
                name="remarques"
                value={formData.remarques || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Remarques additionnelles (facultatif)..."
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
                onClick={() => router.push('/protected/gestion-temps/retard')}
                className="dark:border-gray-700 dark:text-gray-300"
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
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