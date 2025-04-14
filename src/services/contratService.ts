import axios from 'axios';
import { Contrat } from '../types/Contrat';

const API_BASE_URL = 'http://3.67.202.103:8080';
const API_URL = `${API_BASE_URL}/api/contrats`;
const contratService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  getByCollaborateurId: async (collaborateurId: number) => {
    const response = await axios.get(`${API_URL}/collaborateur/${collaborateurId}`);
    return response.data;
  },

  create: async (contrat: Contrat) => {
    try {
      console.log('Données contrat à envoyer:', JSON.stringify(contrat, null, 2));

      // Conversion des valeurs numériques
      const sanitizedData = {
        ...contrat,
        salaireBase: Number(contrat.salaireBase),
        anciennete: contrat.anciennete !== undefined ? Number(contrat.anciennete) : undefined,
        primeTransport: contrat.primeTransport !== undefined ? Number(contrat.primeTransport) : undefined,
        primePanier: contrat.primePanier !== undefined ? Number(contrat.primePanier) : undefined,
        primeRepresentation: contrat.primeRepresentation !== undefined ? Number(contrat.primeRepresentation) : undefined,
        primeResponsabilite: contrat.primeResponsabilite !== undefined ? Number(contrat.primeResponsabilite) : undefined,
        autresPrimes: contrat.autresPrimes !== undefined ? Number(contrat.autresPrimes) : undefined,
        indemnitesKilometriques: contrat.indemnitesKilometriques !== undefined ? Number(contrat.indemnitesKilometriques) : undefined,
        noteDeFrais: contrat.noteDeFrais !== undefined ? Number(contrat.noteDeFrais) : undefined,
        ir: contrat.ir !== undefined ? Number(contrat.ir) : undefined,
        cnss: contrat.cnss !== undefined ? Number(contrat.cnss) : undefined,
        cimr: contrat.cimr !== undefined ? Number(contrat.cimr) : undefined,
        mutuelle: contrat.mutuelle !== undefined ? Number(contrat.mutuelle) : undefined,
        retraite: contrat.retraite !== undefined ? Number(contrat.retraite) : undefined,
      };

      const response = await axios.post(API_URL, sanitizedData);
      return response.data;
    } catch (error) {
      console.error('Error creating contrat:', error);
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

  update: async (id: number, contrat: Contrat) => {
    try {
      // Conversion des valeurs numériques comme dans create
      const sanitizedData = {
        ...contrat,
        salaireBase: Number(contrat.salaireBase),
        anciennete: contrat.anciennete !== undefined ? Number(contrat.anciennete) : undefined,
        primeTransport: contrat.primeTransport !== undefined ? Number(contrat.primeTransport) : undefined,
        primePanier: contrat.primePanier !== undefined ? Number(contrat.primePanier) : undefined,
        primeRepresentation: contrat.primeRepresentation !== undefined ? Number(contrat.primeRepresentation) : undefined,
        primeResponsabilite: contrat.primeResponsabilite !== undefined ? Number(contrat.primeResponsabilite) : undefined,
        autresPrimes: contrat.autresPrimes !== undefined ? Number(contrat.autresPrimes) : undefined,
        indemnitesKilometriques: contrat.indemnitesKilometriques !== undefined ? Number(contrat.indemnitesKilometriques) : undefined,
        noteDeFrais: contrat.noteDeFrais !== undefined ? Number(contrat.noteDeFrais) : undefined,
        ir: contrat.ir !== undefined ? Number(contrat.ir) : undefined,
        cnss: contrat.cnss !== undefined ? Number(contrat.cnss) : undefined,
        cimr: contrat.cimr !== undefined ? Number(contrat.cimr) : undefined,
        mutuelle: contrat.mutuelle !== undefined ? Number(contrat.mutuelle) : undefined,
        retraite: contrat.retraite !== undefined ? Number(contrat.retraite) : undefined,
      };

      const response = await axios.put(`${API_URL}/${id}`, sanitizedData);
      return response.data;
    } catch (error) {
      console.error('Error updating contrat:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    return axios.delete(`${API_URL}/${id}`);
  },

  uploadDocument: async (id: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await axios.post(`${API_URL}/${id}/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading contract document:', error);
      throw error;
    }
  },

  downloadDocument: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/document`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrat_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      return true;
    } catch (error) {
      console.error('Error downloading contract document:', error);
      throw error;
    }
  }
};

export default contratService;