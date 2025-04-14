import axios from 'axios';

const API_BASE_URL = 'http://3.67.202.103:8080';
const API_URL = `${API_BASE_URL}/api/absences`;

export interface Absence {
  id?: number;
  collaborateurId: number;
  dateDebut: string; // format YYYY-MM-DD
  dateFin: string;   // format YYYY-MM-DD
  motif: string;
  status: 'En attente' | 'Approuvée' | 'Rejetée';
  justificatif?: File | string | null;
  justificatifUrl?: string; // URL pour accéder au justificatif
  justificatifNom?: string; // Nom du fichier justificatif
  observations?: string;
}

const absenceService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_URL}/${id}`);

    // Si un justificatif est présent, construire l'URL complète
    if (response.data.justificatifUrl) {
      response.data.justificatifUrl = `${API_BASE_URL}${response.data.justificatifUrl}`;    }

    return response.data;
  },

  getByCollaborateur: async (collaborateurId: number) => {
    const response = await axios.get(`${API_URL}/collaborateur/${collaborateurId}`);
    return response.data;
  },

  create: async (absence: Absence) => {
    try {
      const { justificatif, ...absenceData } = absence;

      // Créer l'absence sans le justificatif
      const response = await axios.post(API_URL, absenceData);

      // Si un justificatif est fourni, l'uploader séparément
      if (justificatif && response.data.id && justificatif instanceof File) {
        const formData = new FormData();
        formData.append('justificatif', justificatif);
        await axios.post(`${API_URL}/${response.data.id}/justificatif`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Récupérer les données mises à jour
        const updatedResponse = await axios.get(`${API_URL}/${response.data.id}`);
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
      const response = await axios.put(`${API_URL}/${id}`, absenceData);

      // Si un justificatif est fourni et c'est un fichier (pas une URL/string), l'uploader
      if (justificatif && justificatif instanceof File) {
        const formData = new FormData();
        formData.append('justificatif', justificatif);
        await axios.post(`${API_URL}/${id}/justificatif`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        // Récupérer les données mises à jour
        const updatedResponse = await axios.get(`${API_URL}/${id}`);
        return updatedResponse.data;
      }

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    return axios.delete(`${API_URL}/${id}`);
  },

  updateStatus: async (id: number, status: 'En attente' | 'Approuvée' | 'Rejetée', observations?: string) => {
    return axios.patch(`${API_URL}/${id}/status`, { status, observations });
  },

  // Nouvelle méthode pour télécharger un justificatif
  downloadJustificatif: async (absenceId: number) => {
    try {
      const response = await axios.get(`${API_URL}/${absenceId}/justificatif`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du justificatif:', error);
      throw error;
    }
  }
};

export default absenceService;