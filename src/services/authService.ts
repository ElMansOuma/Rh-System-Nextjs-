// services/authService.ts
import apiClient from './api';

interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  profilePicture: string | null;
  token: string;
}

const AuthService = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      console.log("Tentative de connexion avec:", credentials);
      const response = await apiClient.post('/api/admins/login', {
        email: credentials.email,
        password: credentials.password
      });

      console.log("Réponse de connexion:", response.data);

      // Stocker le token et les infos utilisateur
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log("Tentative d'inscription avec:", userData);
      const response = await apiClient.post('/api/admins/register', userData);

      console.log("Réponse d'inscription:", response.data);

      // Stocker le token et les infos utilisateur
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: (): any => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
};

export default AuthService;