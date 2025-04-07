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
}

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
        items: [],
      },
      {
        title: "Congés",
        icon: CalendarIcon,
        items: [
          {
            title: "Demande de Congé",
            url: "/protected/conges/demande",
          },
          {
            title: "Historique des Congés",
            url: "/protected/conges/historique",
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
        url: "/auth/deconnexion",
        icon: LogOutIcon,
        items: [],
      },

    ],
  },
];
