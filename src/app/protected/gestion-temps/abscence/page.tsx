"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Calendar, Search, Filter, X, UserPlus } from "lucide-react";
import { Pagination } from '@/components/Pagination';
import { Notification } from '@/components/Notification';
import Link from 'next/link';

// Types pour les données de gestion de temps
interface AbsenceRecord {
  id: number;
  collaborateurId: number;
  collaborateurNom: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  motif: string;
  type: 'Congé payé' | 'Congé sans solde' | 'Maladie' | 'Autre';
  statut: 'Validé' | 'En attente' | 'Refusé';
}

export default function AbsencePage() {
  // États
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // États de recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  // État pour les notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  // Fonction pour afficher les notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  // Fermer la notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Données fictives pour démonstration
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simuler le chargement des données depuis l'API
        setTimeout(() => {
          // Données absences fictives
          const mockAbsences: AbsenceRecord[] = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            collaborateurId: 100 + i,
            collaborateurNom: `Employé ${i + 1}`,
            dateDebut: new Date(2025, 3, i % 28 + 1).toISOString().split('T')[0],
            dateFin: new Date(2025, 3, i % 28 + 1 + i % 5).toISOString().split('T')[0],
            nbJours: 1 + i % 5,
            motif: i % 4 === 0 ? 'Vacances' : i % 4 === 1 ? 'Maladie' : i % 4 === 2 ? 'Événement familial' : 'Formation',
            type: i % 4 === 0 ? 'Congé payé' : i % 4 === 1 ? 'Maladie' : i % 4 === 2 ? 'Congé sans solde' : 'Autre',
            statut: i % 3 === 0 ? 'Validé' : i % 3 === 1 ? 'En attente' : 'Refusé'
          }));

          setAbsences(mockAbsences);
          setLoading(false);
        }, 800);

      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer les données en fonction des critères de recherche
  const filteredAbsences = absences.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.collaborateurNom.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter === '' ||
      (item.dateDebut <= dateFilter && item.dateFin >= dateFilter);

    const matchesStatus = statusFilter === 'Tous' || item.statut === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Obtenir les données paginées
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAbsences.slice(startIndex, endIndex);
  };

  // Obtenir le total d'éléments
  const getTotalItems = () => {
    return filteredAbsences.length;
  };

  // Changer de page
  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(getTotalItems() / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Changer le nombre d'éléments par page
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setStatusFilter('Tous');
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(getTotalItems() / itemsPerPage);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 15, 20, 30];

  // Afficher le statut d'absence avec couleur
  const getAbsenceStatusBadge = (status: string) => {
    let colorClass = '';
    switch (status) {
      case 'Validé':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        break;
      case 'En attente':
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        break;
      case 'Refusé':
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {status}
      </span>
    );
  };

  // Afficher le type d'absence avec couleur
  const getAbsenceTypeBadge = (type: string) => {
    let colorClass = '';
    switch (type) {
      case 'Congé payé':
        colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        break;
      case 'Congé sans solde':
        colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        break;
      case 'Maladie':
        colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Link href="/protected/gestion-temps">
            <Button variant="default" size="sm">
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Gestion des Absences</h1>
        </div>
        <Link href="/protected/gestion-temps/abscence/add">
          <Button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nouvelle Absence
          </Button>
        </Link>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap gap-4 mt-6 mb-6">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        </div>

        <div className="w-48">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
        </div>

        <div className="w-48">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Validé">Validé</option>
              <option value="En attente">En attente</option>
              <option value="Refusé">Refusé</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={resetFilters}
          className="flex items-center space-x-1 dark:border-gray-700 dark:text-gray-300"
        >
          <X size={14} />
          <span>Réinitialiser</span>
        </Button>
      </div>

      {/* Résumé des résultats */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-300 font-medium">
            {loading ? 'Chargement des données...' : `${getTotalItems()} entrée(s) trouvée(s)`}
          </div>

          {/* Sélecteur d'éléments par page */}
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Afficher</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white transition-colors"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span>par page</span>
          </div>
        </div>
      </div>

      {/* Tableau des absences */}
      <div className={`bg-white dark:bg-gray-800 shadow-md ${!loading && totalPages > 0 ? 'rounded-b-lg' : 'rounded-lg'} overflow-hidden`}>
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow className="dark:border-gray-600">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collaborateur</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date début</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date fin</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jours</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Motif</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : getPaginatedData().length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Aucune entrée trouvée
                </TableCell>
              </TableRow>
            ) : (
              getPaginatedData().map((item: any) => (
                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.collaborateurNom}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.dateDebut}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.dateFin}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.nbJours}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getAbsenceTypeBadge(item.type)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.motif}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getAbsenceStatusBadge(item.statut)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={getTotalItems()}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          className="mt-6"
        />
      )}

      {/* Affichage d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
    </div>
  );
}