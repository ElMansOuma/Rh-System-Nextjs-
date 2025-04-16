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
  icon?: React.ComponentType<any>;
  items?: NavItem[];
  onClick?: () => void;
}

// Define the type for a navigation section
export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Tableau de bord",
        icon: HomeIcon,
        url: "/protected/dashboard",
        items: [] as NavItem[],
      },
      {
        title: "Collaborateurs",
        url: "/protected/collaborateurs",
        icon: UserIcon,
        items: [] as NavItem[],
      },
      {
        title: "Contrats",
        url: "/protected/contrats",
        icon: TableIcon,
        items: [] as NavItem[],
      },
      {
        title: "Absences",
        url: "/protected/gestion-temps/abscence",
        icon: CalendarIcon,
        items: [] as NavItem[],
      },
      {
        title: "Paramètres",
        icon: SettingsIcon,
        url: "/protected/pages/settings",
        items: [] as NavItem[],
      },
    ],
  },
];