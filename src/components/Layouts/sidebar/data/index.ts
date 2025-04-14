import React from 'react';
import {
  HomeIcon,
  UserIcon,
  CalendarIcon,
  TableIcon,
  SettingsIcon,
  LogOutIcon
} from 'lucide-react';

// Define a type for navigation items
export interface NavItem {
  title: string;
  url?: string;
  icon?: React.ComponentType;
  items?: NavItem[];
  onClick?: () => void; // Ajout d'une propriété onClick

}
const handleLogout = () => {
  // Supprimer le token d'authentification du localStorage ou sessionStorage
  localStorage.removeItem('authToken'); // Ajustez selon votre mécanisme de stockage

  // Vous pourriez également avoir besoin d'appeler une API pour invalider le token côté serveur
  // fetch('/api/logout', { method: 'POST' });

  // Rediriger vers la page de connexion
  window.location.href = "/public/auth/sign-in";
};
export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [

      {
        title: "Tableau de bord",
        icon: HomeIcon,
        url: "/test",
        items: [],
      },
      {
        title: "Collaborateurs",
        url: "/protected/collaborateurs",
        icon: UserIcon,
        items: [],
      },
      {
        title: "Contrats",
        url: "/protected/contrats",
        icon: TableIcon,
        items: [
        ],
      },
      {
        title: "Gestion Temps",
        url: "/protected/gestion-temps",
        icon: CalendarIcon,
        items: [
          {
            title: "absences",
            url: "/protected/gestion-temps/abscence",
          },
        ],
      },


      {
        title: "Paramètres",
        icon: SettingsIcon,
        items: [
          {
            title: "Paramètres du Compte",
            url: "/protected/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "AUTRES",

    items: [
      {
        title: "Déconnexion",
        url: "#", // URL fictive, l'action sera gérée par onClick
        icon: LogOutIcon,
        onClick: handleLogout, // Ajout de la fonction de déconnexion
        items: [],
      },
    ],
  },
];
