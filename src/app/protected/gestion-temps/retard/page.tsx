"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Search, Filter, X, UserPlus, ArrowLeft } from "lucide-react";
import { Pagination } from '@/components/Pagination';
import { toast } from "sonner";
import retardService from '@/services/retardService';

// Types pour les données de retards
interface RetardRecord {
  id: number;
  collaborateurId: number;
  collaborateurNom: string;
  date: string;
  minutesRetard: number;
  justification?: string;
  statut: string;
  heurePrevu?: string;
  heureArrivee?: string;
  remarques?: string;
}

export default function RetardsPage() {
  // États pour les données
  const [retards, setRetards] = useState<RetardRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // États de recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  // Charger les données réelles depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Appel au service pour récupérer les données réelles
        const data = await retardService.getAll();

        // Transforme les données si nécessaire pour correspondre à la structure attendue
        const formattedData = data.map((item: any) => ({
          id: item.id,
          collaborateurId: item.collaborateurId,
          collaborateurNom: item.collaborateurNom || `${item.collaborateur?.nom} ${item.collaborateur?.prenom}`,
          date: item.date,
          minutesRetard: item.dureeRetard,
          justification: item.justification,
          statut: item.statut,
          heurePrevu: item.heurePrevu,
          heureArrivee: item.heureArrivee,
          remarques: item.remarques
        }));

        setRetards(formattedData);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
        setLoading(false);

        // Gérer les erreurs d'authentification
        if (err.response && err.response.status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      }
    };

    fetchData();
  }, [router]);

  // Filtrer les données en fonction des critères de recherche
  const filteredRetards = retards.filter(item => {
    const matchesSearch = searchTerm === '' ||
      (item.collaborateurNom && item.collaborateurNom.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = dateFilter === '' || item.date === dateFilter;

    const matchesStatus = statusFilter === 'Tous' || item.statut === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Obtenir les données paginées
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRetards.slice(startIndex, endIndex);
  };

  // Changer de page
  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(filteredRetards.length / itemsPerPage);
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

  // Obtenir le total d'éléments
  const getTotalItems = () => filteredRetards.length;

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(getTotalItems() / itemsPerPage);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 15, 20, 30];

  // Formatter la date pour l'affichage
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Afficher le statut de retard avec couleur
  const getRetardStatusBadge = (status: string) => {
    let colorClass;

    switch(status) {
      case 'Justifié':
      case 'Validé':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        break;
      case 'Non justifié':
      case 'Refusé':
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        break;
      case 'Non traité':
        colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        break;
      case 'En attente de justificatif':
        colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
        break;
      default:
        colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/protected/gestion-temps">
            <Button variant="default" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Gestion des Retards</h1>
        </div>
        <Link href="/protected/gestion-temps/retard/add">
          <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <UserPlus className="mr-2 h-4 w-4" />
            Nouveau Retard
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
              <option value="Justifié">Justifié</option>
              <option value="Non justifié">Non justifié</option>
              <option value="Non traité">Non traité</option>
              <option value="Validé">Validé</option>
              <option value="Refusé">Refusé</option>
              <option value="En attente de justificatif">En attente de justificatif</option>
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
            {loading ? 'Chargement des données...' : `${getTotalItems()} retard(s) trouvé(s)`}
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

      {/* Tableau des retards */}
      <div className={`bg-white dark:bg-gray-800 shadow-md ${!loading && totalPages > 0 ? 'rounded-b-lg' : 'rounded-lg'} overflow-hidden`}>
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow className="dark:border-gray-600">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collaborateur</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Minutes de retard</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Justification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : getPaginatedData().length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Aucun retard trouvé
                </TableCell>
              </TableRow>
            ) : (
              getPaginatedData().map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.collaborateurNom}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{formatDate(item.date)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.minutesRetard} min</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getRetardStatusBadge(item.statut)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {item.justification || '-'}
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