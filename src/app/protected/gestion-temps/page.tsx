"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle, Clock } from "lucide-react";

export default function GestionTempsPage() {
  const router = useRouter();

  // Cartes pour la navigation
  const navigationCards = [
    {
      title: "Pointage",
      description: "Gérer les entrées et sorties des employés",
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      path: "/protected/gestion-temps/pointage",
      color: "border-blue-500",
      bgHover: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
    },
    {
      title: "Retards",
      description: "Suivre et gérer les retards des employés",
      icon: <AlertCircle className="h-8 w-8 text-yellow-500" />,
      path: "/protected/gestion-temps/retard",
      color: "border-yellow-500",
      bgHover: "hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
    },
    {
      title: "Absences",
      description: "Gérer les congés et absences",
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      path: "/protected/gestion-temps/abscence",
      color: "border-green-500",
      bgHover: "hover:bg-green-50 dark:hover:bg-green-900/20"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestion du Temps</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {navigationCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${card.color} ${card.bgHover} cursor-pointer transition-all duration-200 transform hover:scale-105`}
            onClick={() => router.push(card.path)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{card.title}</h3>
              {card.icon}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{card.description}</p>
            <Button
              className="w-full"
              onClick={() => router.push(card.path)}
            >
              Accéder
            </Button>
          </div>
        ))}
      </div>

      {/* Statistiques rapides */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Aperçu général</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Taux de présence</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">92%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Ce mois-ci</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Retards</h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">15</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Ce mois-ci</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Congés en attente</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">7</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">À valider</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Heures moyennes</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">7.8h</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Par jour</p>
        </div>
      </div>

      {/* Informations complémentaires */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Informations complémentaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Règles de pointage</h4>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
              <li>Arrivée entre 08:00 et 09:30</li>
              <li>Pause déjeuner de 12:00 à 14:00</li>
              <li>Départ entre 17:00 et 19:00</li>
              <li>Minimum 7h de présence par jour</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Procédure d'absence</h4>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
              <li>Demande à soumettre au moins 2 semaines à l'avance</li>
              <li>Justificatif médical obligatoire pour absences maladie</li>
              <li>Maximum 5 jours consécutifs sans validation RH</li>
              <li>Validation sous 48h par votre responsable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}