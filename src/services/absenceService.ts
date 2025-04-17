import apiClient, { API_BASE_URL } from './api';

const API_URL = `/api/absences`;

// Modifié pour correspondre aux constantes de l'enum Java
export type MotifAbsence =
  'MALADIE' |
  'CONGE_PAYE' |
  'CONGE_SANS_SOLDE' |
  'FORMATION' |
  'EVENEMENT_FAMILIAL' |
  'AUTRE';

// Map pour convertir les noms d'enum en libellés affichables
export const motifLibelles: Record<MotifAbsence, string> = {
  'MALADIE': 'Maladie',
  'CONGE_PAYE': 'Congé payé',
  'CONGE_SANS_SOLDE': 'Congé sans solde',
  'FORMATION': 'Formation',
  'EVENEMENT_FAMILIAL': 'Événement familial',
  'AUTRE': 'Autre'
};

export interface Absence {
  id?: number;
  collaborateurId: number;
  dateDebut: string; // format YYYY-MM-DD
  dateFin: string;   // format YYYY-MM-DD
  motif: MotifAbsence;
  observations?: string;
  justificatif?: File | string | null;
  justificatifUrl?: string; // URL pour accéder au justificatif
  justificatifNom?: string; // Nom du fichier justificatif
}

const absenceService = {
  getAll: async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`${API_URL}/${id}`);

    // Si un justificatif est présent, construire l'URL complète
    if (response.data.justificatifUrl) {
      response.data.justificatifUrl = `${API_BASE_URL}${response.data.justificatifUrl}`;
    }

    return response.data;
  },

  getByCollaborateur: async (collaborateurId: number) => {
    const response = await apiClient.get(`${API_URL}/collaborateur/${collaborateurId}`);
    return response.data;
  },

  getMotifs: async () => {
    const response = await apiClient.get(`${API_URL}/motifs`);
    return response.data;
  },

  // Obtenir la liste des motifs avec leurs libellés
  getMotifOptions: async (): Promise<{value: MotifAbsence, label: string}[]> => {
    const motifs = await absenceService.getMotifs();
    // Créer des options pour les listes déroulantes
    return Object.entries(motifLibelles).map(([value, label]) => ({
      value: value as MotifAbsence,
      label
    }));
  },

  create: async (absence: Absence) => {
    try {
      const { justificatif, ...absenceData } = absence;

      // Créer l'absence sans le justificatif
      const response = await apiClient.post(API_URL, absenceData);

      // Si un justificatif est fourni, l'uploader séparément
      if (justificatif && response.data.id && justificatif instanceof File) {
        const formData = new FormData();
        formData.append('justificatif', justificatif);
        await apiClient.post(`${API_URL}/${response.data.id}/justificatif`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Récupérer les données mises à jour
        const updatedResponse = await apiClient.get(`${API_URL}/${response.data.id}`);
        return updatedResponse.data;
      }

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'absence:', error);
      throw error;
    }
  },

  update: async (id: number, absence: Absence) => {
    try {
      const { justificatif, ...absenceData } = absence;

      // Mettre à jour l'absence sans le justificatif
      const response = await apiClient.put(`${API_URL}/${id}`, absenceData);

      // Si un justificatif est fourni et c'est un fichier (pas une URL/string), l'uploader
      if (justificatif && justificatif instanceof File) {
        const formData = new FormData();
        formData.append('justificatif', justificatif);
        await apiClient.post(`${API_URL}/${id}/justificatif`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        // Récupérer les données mises à jour
        const updatedResponse = await apiClient.get(`${API_URL}/${id}`);
        return updatedResponse.data;
      }

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    return apiClient.delete(`${API_URL}/${id}`);
  },

  updateObservations: async (id: number, observations: string) => {
    return apiClient.patch(`${API_URL}/${id}/observations`, observations);
  },

  // Méthode pour télécharger un justificatif
  downloadJustificatif: async (absenceId: number) => {
    try {
      const response = await apiClient.get(`${API_URL}/${absenceId}/justificatif`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du justificatif:', error);
      throw error;
    }
  },

  // Helper pour convertir un libellé en valeur d'enum
  getMotifEnumFromLibelle: (libelle: string): MotifAbsence | undefined => {
    const entry = Object.entries(motifLibelles).find(([_, value]) => value === libelle);
    return entry ? entry[0] as MotifAbsence : undefined;
  },

  // Helper pour obtenir le libellé à partir d'une valeur d'enum
  getMotifLibelle: (motif: MotifAbsence): string => {
    return motifLibelles[motif] || motif;
  }
};

export default absenceService;