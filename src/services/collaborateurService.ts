import apiClient from './api';
import axios from "axios";

// Constantes
const API_URL = `/api/collaborateurs`;

// Fonction utilitaire pour obtenir l'URL complète des images
export const getPhotoUrl = (collaborateurId: number): string => {
  // Récupérer la base URL depuis une variable d'environnement, ou utiliser la valeur par défaut
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://3.67.202.103:8080';
  return `${baseUrl}${API_URL}/${collaborateurId}/photo`;
};

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
  photo?: File | null | Blob | string;
  photoUrl?: string;
}

const collaborateurService = {
  getAll: async () => {
    const response = await apiClient.get(API_URL);
    // Ajouter l'URL de la photo pour chaque collaborateur
    const collaborateurs = response.data.map((collab: Collaborateur) => ({
      ...collab,
      photoUrl: collab.id ? getPhotoUrl(collab.id) : undefined
    }));
    return collaborateurs;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    // Ajouter l'URL de la photo
    return {
      ...response.data,
      photoUrl: getPhotoUrl(id)
    };
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

    const response = await apiClient.get(url);
    // Ajouter l'URL de la photo pour chaque collaborateur
    const collaborateurs = response.data.map((collab: Collaborateur) => ({
      ...collab,
      photoUrl: collab.id ? getPhotoUrl(collab.id) : undefined
    }));
    return collaborateurs;
  },

  create: async (collaborateur: Collaborateur) => {
    try {
      // Log des données avant envoi
      console.log('Données collaborateur à envoyer:', JSON.stringify(collaborateur, null, 2));

      // Créer un nouveau collaborateur sans la photo
      const { photo, photoUrl, ...collaborateurData } = collaborateur;

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

      const response = await apiClient.post(API_URL, sanitizedData);
      console.log('Réponse création collaborateur:', response.data);

      // Si une photo est fournie, l'uploader séparément
      if (photo && response.data.id) {
        console.log('Téléchargement de la photo pour le collaborateur ID:', response.data.id);
        const formData = new FormData();
        formData.append('photo', photo);
        await apiClient.post(`${API_URL}/${response.data.id}/photo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Récupérer les données mises à jour avec la photo
        const updatedResponse = await apiClient.get(`${API_URL}/${response.data.id}`);
        return {
          ...updatedResponse.data,
          photoUrl: getPhotoUrl(response.data.id)
        };
      }

      return {
        ...response.data,
        photoUrl: response.data.id ? getPhotoUrl(response.data.id) : undefined
      };
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
      const { photo, photoUrl, ...collaborateurData } = collaborateur;
      const response = await apiClient.put(`${API_URL}/${id}`, collaborateurData);

      // Si une photo est fournie et que c'est un File/Blob (pas une URL string), l'uploader séparément
      if (photo && typeof photo !== 'string') {
        const formData = new FormData();
        formData.append('photo', photo);
        await apiClient.post(`${API_URL}/${id}/photo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Récupérer les données mises à jour avec la photo
        const updatedResponse = await apiClient.get(`${API_URL}/${id}`);
        return {
          ...updatedResponse.data,
          photoUrl: getPhotoUrl(id)
        };
      }

      return {
        ...response.data,
        photoUrl: getPhotoUrl(id)
      };
    } catch (error) {
      console.error('Error updating collaborateur:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    return apiClient.delete(`${API_URL}/${id}`);
  },

  // Méthode spécifique pour récupérer l'URL de la photo
  getPhotoUrl
};

export default collaborateurService;