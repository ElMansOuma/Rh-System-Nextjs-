import axios from 'axios';

const API_URL = 'http://localhost:8080/api/documents';

export interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
}

const documentService = {
  uploadDocument: async (collaborateurId: number, file: File, documentType: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await axios.post(
        `${API_URL}/upload/${collaborateurId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      throw error;
    }
  },

  getDocumentsByCollaborateur: async (collaborateurId: number) => {
    try {
      const response = await axios.get(`${API_URL}/collaborateur/${collaborateurId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      throw error;
    }
  },

  getDocument: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du document:', error);
      throw error;
    }
  },

  downloadDocument: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/download`, {
        responseType: 'blob'
      });

      // Récupérer les métadonnées du document pour obtenir le nom du fichier
      const document = await documentService.getDocument(id);

      // Créer un URL temporaire pour le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      document.body.appendChild(link);
      link.click();

      // Nettoyage
      window.URL.revokeObjectURL(url);
      link.remove();

      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      throw error;
    }
  },

  viewDocument: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/view`, {
        responseType: 'blob'
      });

      // Créer un URL pour l'affichage du document
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Ouvrir dans un nouvel onglet
      window.open(url, '_blank');

      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'affichage du document:', error);
      throw error;
    }
  },

  deleteDocument: async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  }
};

export default documentService;