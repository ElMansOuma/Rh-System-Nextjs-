import apiClient, { API_BASE_URL } from './api';

const API_URL = `/api/absences`;

// Modifié pour correspondre à l'entité MotifAbsence du backend
export interface MotifAbsence {
  id: number;
  code: string;
  libelle: string;
  couleur: string;
}

export interface Absence {
  id?: number;
  collaborateurId: number;
  dateDebut: string; // format YYYY-MM-DD
  dateFin: string;   // format YYYY-MM-DD
  motif: MotifAbsence; // changé pour correspondre à l'entity du backend
  observations?: string;
  justificatifPath?: string;
  justificatifNom?: string;
  justificatifUrl?: string; // URL pour accéder au justificatif
  justificatif?: File | null; // Pour l'upload de fichier (non stocké dans le backend)
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

  // Récupérer tous les motifs d'absence
  getAllMotifs: async (): Promise<MotifAbsence[]> => {
    const response = await apiClient.get(`/api/motifs-absence`);
    return response.data;
  },

  // Créer des options pour les listes déroulantes
  getMotifOptions: async (): Promise<{value: number, label: string, couleur: string}[]> => {
    const motifs = await absenceService.getAllMotifs();
    return motifs.map(motif => ({
      value: motif.id,
      label: motif.libelle,
      couleur: motif.couleur
    }));
  },

  create: async (absence: Absence) => {
    try {
      const { justificatif, ...absenceData } = absence;

      // Créer un objet de requête correctement formaté - Conserve l'objet motif complet
      const requestData = {
        collaborateurId: absenceData.collaborateurId,
        dateDebut: absenceData.dateDebut,
        dateFin: absenceData.dateFin,
        motif: absenceData.motif, // Envoi de l'objet motif complet
        observations: absenceData.observations || ''
      };

      // Débogage - vérifier ce qui est envoyé
      console.log('Sending absence data:', JSON.stringify(requestData));

      // Envoyer les données d'absence
      const response = await apiClient.post(API_URL, requestData);

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

      // Créer un objet de requête correctement formaté
      const requestData = {
        collaborateurId: absenceData.collaborateurId,
        dateDebut: absenceData.dateDebut,
        dateFin: absenceData.dateFin,
        motif: absenceData.motif, // Envoi de l'objet motif complet
        observations: absenceData.observations || ''
      };

      // Mettre à jour l'absence avec l'objet motif complet
      const response = await apiClient.put(`${API_URL}/${id}`, requestData);

      // Si un justificatif est fourni et c'est un fichier, l'uploader
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

  // Helper pour obtenir un motif par son code
  getMotifByCode: async (code: string): Promise<MotifAbsence | undefined> => {
    const motifs = await absenceService.getAllMotifs();
    return motifs.find(motif => motif.code === code);
  },

  // Helper pour obtenir le libellé à partir d'un motif
  getMotifLibelle: (motif: MotifAbsence | null): string => {
    return motif ? motif.libelle : '';
  },

  // Helper pour obtenir la couleur à partir d'un motif
  getMotifCouleur: (motif: MotifAbsence | null): string => {
    return motif ? motif.couleur : '#CCCCCC'; // Couleur par défaut
  }
};

export default absenceService;