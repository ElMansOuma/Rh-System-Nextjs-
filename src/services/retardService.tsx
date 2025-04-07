import axios from 'axios';

const API_URL = 'http://localhost:8080/api/retards';

export interface RetardDTO {
  id?: number;
  collaborateurId: number;
  collaborateurNom?: string;
  date: string;
  heurePrevu: string;
  heureArrivee: string;
  dureeRetard: number;
  statut: 'Non traité' | 'Validé' | 'Refusé' | 'En attente de justificatif';
  justification: string;
  remarques?: string;
}

// Configure axios to display more details about errors
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Axios Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    return Promise.reject(error);
  }
);

// Helper function to get the JWT token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const retardService = {
  getAll: async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching retards:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching retard with id ${id}:`, error);
      throw error;
    }
  },

  getByCollaborateur: async (collaborateurId: number) => {
    try {
      const response = await axios.get(`${API_URL}/collaborateur/${collaborateurId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching retards for collaborateur ${collaborateurId}:`, error);
      throw error;
    }
  },

  getByDate: async (date: string) => {
    try {
      const response = await axios.get(`${API_URL}/date?date=${date}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching retards for date ${date}:`, error);
      throw error;
    }
  },

  getByStatut: async (statut: string) => {
    try {
      const response = await axios.get(`${API_URL}/statut/${statut}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching retards with status ${statut}:`, error);
      throw error;
    }
  },

  getByPeriod: async (dateDebut: string, dateFin: string) => {
    try {
      const response = await axios.get(`${API_URL}/period?dateDebut=${dateDebut}&dateFin=${dateFin}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching retards for period ${dateDebut} to ${dateFin}:`, error);
      throw error;
    }
  },

  create: async (retard: RetardDTO) => {
    try {
      console.log('Creating retard:', JSON.stringify(retard, null, 2));
      const response = await axios.post(API_URL, retard, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error creating retard:', error);
      throw error;
    }
  },

  update: async (id: number, retard: RetardDTO) => {
    try {
      console.log(`Updating retard ${id}:`, JSON.stringify(retard, null, 2));
      const response = await axios.put(`${API_URL}/${id}`, retard, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error updating retard ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (id: number, statut: string, remarques?: string) => {
    try {
      const payload = { statut, remarques };
      const response = await axios.patch(`${API_URL}/${id}/status`, payload, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error updating status for retard ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      return true;
    } catch (error) {
      console.error(`Error deleting retard ${id}:`, error);
      throw error;
    }
  },

  getStats: async (year: number, month?: number) => {
    try {
      let url = `${API_URL}/stats/${year}`;
      if (month) {
        url += `/${month}`;
      }
      const response = await axios.get(url, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching retard statistics:`, error);
      throw error;
    }
  }
};

export default retardService;