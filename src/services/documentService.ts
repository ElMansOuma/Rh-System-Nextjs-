import axios from 'axios';
import { toast } from "sonner";

const API_BASE_URL = 'http://3.67.202.103:8080';
const API_URL = `${API_BASE_URL}/api/documents`;

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

      // Add success notification
      toast.success('Document téléchargé avec succès');

      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      // Add error notification
      toast.error('Erreur lors du téléchargement du document');
      throw error;
    }
  },

  getDocumentsByCollaborateur: async (collaborateurId: number) => {
    try {
      const response = await axios.get(`${API_URL}/collaborateur/${collaborateurId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      toast.error('Erreur lors de la récupération des documents');
      throw error;
    }
  },

  getDocument: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du document:', error);
      toast.error('Erreur lors de la récupération du document');
      throw error;
    }
  },

  downloadDocument: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/download`, {
        responseType: 'blob'
      });

      // Récupérer les métadonnées du document pour obtenir le nom du fichier
      const docInfo = await documentService.getDocument(id);

      // Créer un URL temporaire pour le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', docInfo.name);
      window.document.body.appendChild(link);
      link.click();

      // Nettoyage
      window.URL.revokeObjectURL(url);
      link.remove();

      // Add success notification
      toast.success(`Document "${docInfo.name}" téléchargé avec succès`);

      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      toast.error('Erreur lors du téléchargement du document');
      throw error;
    }
  },

  viewDocument: async (id: number) => {
    try {
      // Récupérer les métadonnées du document pour déterminer le type
      const docInfo = await documentService.getDocument(id);
      const response = await axios.get(`${API_URL}/${id}/view`, {
        responseType: 'blob'
      });

      // Déterminer le type MIME approprié
      let mimeType = 'application/octet-stream'; // Type par défaut
      const fileName = docInfo.name.toLowerCase();

      if (fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        mimeType = 'application/msword';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      }

      // Créer un URL pour l'affichage du document avec le bon type MIME
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      // Ouvrir dans un nouvel onglet
      window.open(url, '_blank');

      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'affichage du document:', error);
      toast.error('Erreur lors de l\'affichage du document');
      throw error;
    }
  },

  deleteDocument: async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      // Add success notification
      toast.success('Document supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      toast.error('Erreur lors de la suppression du document');
      throw error;
    }
  }
};

export default documentService;