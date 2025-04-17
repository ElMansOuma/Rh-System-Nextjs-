// services/api.ts
import axios from 'axios';

// Utiliser la variable d'environnement
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

console.log("API URL:", API_BASE_URL, "Environnement:", process.env.NODE_ENV); // Pour déboguer

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    console.log("Requête envoyée à:", config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Erreur d'intercepteur de requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => {
    console.log("Réponse reçue:", response.status);
    return response;
  },
  (error) => {
    console.error("Erreur de réponse:", error);
    if (error.response && error.response.status === 401) {
      // Rediriger vers la page de connexion si non authentifié
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/public/auth/sign-in';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };