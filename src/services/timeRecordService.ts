import axios from 'axios';

const API_URL = 'http://localhost:8080/api/pointages';

export interface TimeRecordDTO {
  id?: number;
  collaborateurId: number;
  collaborateurNom?: string;
  date: string;
  heureEntree?: string;
  heureSortie?: string;
  totalHeures?: number;
  statut: 'Présent' | 'Retard' | 'Absent' | 'Congé' | 'Mission';
  justification?: string;
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

const timeRecordService = {
  getAll: async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching time records:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching time record with id ${id}:`, error);
      throw error;
    }
  },

  getByCollaborateur: async (collaborateurId: number) => {
    try {
      const response = await axios.get(`${API_URL}/collaborateur/${collaborateurId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching time records for collaborateur ${collaborateurId}:`, error);
      throw error;
    }
  },

  getByDate: async (date: string) => {
    try {
      const response = await axios.get(`${API_URL}/date?date=${date}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching time records for date ${date}:`, error);
      throw error;
    }
  },

  getByStatut: async (statut: string) => {
    try {
      const response = await axios.get(`${API_URL}/statut/${statut}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error fetching time records with status ${statut}:`, error);
      throw error;
    }
  },

  create: async (timeRecord: TimeRecordDTO) => {
    try {
      console.log('Creating time record:', JSON.stringify(timeRecord, null, 2));
      const response = await axios.post(API_URL, timeRecord, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error creating time record:', error);
      throw error;
    }
  },

  update: async (id: number, timeRecord: TimeRecordDTO) => {
    try {
      console.log(`Updating time record ${id}:`, JSON.stringify(timeRecord, null, 2));
      const response = await axios.put(`${API_URL}/${id}`, timeRecord, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error(`Error updating time record ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      return true;
    } catch (error) {
      console.error(`Error deleting time record ${id}:`, error);
      throw error;
    }
  }
};

export default timeRecordService;