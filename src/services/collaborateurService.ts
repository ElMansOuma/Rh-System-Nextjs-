import axios from 'axios';

const API_URL = 'http://localhost:8080/api/collaborateurs';

export interface Collaborateur {
  id?: number;
  prenom: string;
  nom: string;
  sexe: string;
  cin: string;
  dateNaissance: string;
  status: string;
  email: string;
  matricule?: string;
  telephone?: string;
  electionDomicile?: string;
  situationFamiliale?: string;
  nombrePersonnesACharge?: number;
  cnss?: string;
  nombreAnneeExperience?: number;
  niveauQualification?: string;
  titrePosteOccupe?: string;
  rib?: string;
  situationEntreprise?: string;
  dateEmbauche?: string;
  tachesAccomplies?: string;
  photo?: File | null | Blob;
}

// Configurer axios pour afficher plus de détails sur les erreurs
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

const collaborateurService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  search: async (searchTerm?: string, status?: string) => {
    let url = `${API_URL}/search`;
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    if (status) {
      params.append('status', status);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await axios.get(url);
    return response.data;
  },

  create: async (collaborateur: Collaborateur) => {
    try {
      // Log des données avant envoi
      console.log('Données collaborateur à envoyer:', JSON.stringify(collaborateur, null, 2));

      // Créer un nouveau collaborateur sans la photo
      const { photo, ...collaborateurData } = collaborateur;

      // Correction des types potentiellement problématiques
      const sanitizedData = {
        ...collaborateurData,
        // Convertir explicitement en nombre si nécessaire
        nombrePersonnesACharge: collaborateurData.nombrePersonnesACharge !== undefined ?
          Number(collaborateurData.nombrePersonnesACharge) : undefined,
        nombreAnneeExperience: collaborateurData.nombreAnneeExperience !== undefined ?
          Number(collaborateurData.nombreAnneeExperience) : undefined,
      };

      console.log('Données sanitisées à envoyer:', JSON.stringify(sanitizedData, null, 2));

      const response = await axios.post(API_URL, sanitizedData);
      console.log('Réponse création collaborateur:', response.data);

      // Si une photo est fournie, l'uploader séparément
      if (photo && response.data.id) {
        console.log('Téléchargement de la photo pour le collaborateur ID:', response.data.id);
        const formData = new FormData();
        formData.append('photo', photo);
        await axios.post(`${API_URL}/${response.data.id}/photo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Récupérer les données mises à jour avec la photo
        const updatedResponse = await axios.get(`${API_URL}/${response.data.id}`);
        return updatedResponse.data;
      }

      return response.data;
    } catch (error) {
      console.error('Error creating collaborateur:', error);
      // Ajout de détails d'erreur spécifiques
      if (axios.isAxiosError(error) && error.response) {
        console.error('Détails de l\'erreur HTTP:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      throw error;
    }
  },

  update: async (id: number, collaborateur: Collaborateur) => {
    try {
      // Mettre à jour le collaborateur sans la photo
      const { photo, ...collaborateurData } = collaborateur;
      const response = await axios.put(`${API_URL}/${id}`, collaborateurData);

      // Si une photo est fournie, l'uploader séparément
      if (photo && typeof photo !== 'string') {
        const formData = new FormData();
        formData.append('photo', photo);
        await axios.post(`${API_URL}/${id}/photo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Récupérer les données mises à jour avec la photo
        const updatedResponse = await axios.get(`${API_URL}/${id}`);
        return updatedResponse.data;
      }

      return response.data;
    } catch (error) {
      console.error('Error updating collaborateur:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    return axios.delete(`${API_URL}/${id}`);
  }
};

export default collaborateurService;