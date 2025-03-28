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
        items: [
          {
            title: "Congé",
            url: "/dashboard/conge",
          },
          {
            title: "Pointage",
            url: "/dashboard/pointage",
          },
          {
            title: "Contrat",
            url: "/dashboard/contrat",
          },
        ],
      },
      {
        title: "Collaborateurs",
        url: "/collaborateurs",
        icon: UserIcon,
        items: [
          {
            title: "Liste des Collaborateurs",
            url: "/collaborateurs",
          },
        ],
      },
      {
        title: "Gestion du Temps",
        url: "/gestion-temps",
        icon: CalendarIcon,
        items: [
          {
            title: "Pointage",
            url: "/gestion-temps/pointage",
          },
          {
            title: "Retards",
            url: "/gestion-temps/retards",
          },
        ],
      },
      {
        title: "Congés",
        icon: CalendarIcon,
        items: [
          {
            title: "Demande de Congé",
            url: "/conges/demande",
          },
          {
            title: "Historique des Congés",
            url: "/conges/historique",
          },
        ],
      },
      {
        title: "Contrats",
        url: "/contrats",
        icon: TableIcon,
        items: [
          {
            title: "Liste des Contrats",
            url: "/contrats/liste",
          },
        ],
      },
      {
        title: "Paramètres",
        icon: SettingsIcon,
        items: [
          {
            title: "Paramètres du Compte",
            url: "/parametres/compte",
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
