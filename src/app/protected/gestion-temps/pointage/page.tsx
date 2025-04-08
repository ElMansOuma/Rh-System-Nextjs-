"use client";
import React, { useState, useEffect } from 'react';
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
import { Search, Filter, X, UserPlus, Clock, Edit, Trash2 } from "lucide-react";
import { Pagination } from '@/components/Pagination';
import { toast } from "sonner";
import timeRecordService, { TimeRecordDTO } from '@/services/timeRecordService';

export default function PointagePage() {
  // États pour les données
  const [pointages, setPointages] = useState<TimeRecordDTO[]>([]);
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

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: TimeRecordDTO[] = [];

        // Appliquer les filtres côté serveur si possible
        if (dateFilter !== '') {
          data = await timeRecordService.getByDate(dateFilter);
        } else if (statusFilter !== 'Tous') {
          data = await timeRecordService.getByStatut(statusFilter);
        } else {
          data = await timeRecordService.getAll();
        }

        setPointages(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des données:', err);
        // Vérifier si c'est une erreur d'authentification
        if (err.response && err.response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          // Rediriger vers la page de connexion après un court délai
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setError('Impossible de charger les données. Veuillez réessayer plus tard.');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, statusFilter, router]); // Recharger quand les filtres principaux changent

  // Filtrer les données en fonction du terme de recherche
  const filteredPointages = pointages.filter(item => {
    const matchesSearch = searchTerm === '' ||
      (item.collaborateurNom && item.collaborateurNom.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  // Obtenir les données paginées
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPointages.slice(startIndex, endIndex);
  };

  // Changer de page
  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(filteredPointages.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setStatusFilter('Tous');
  };

  // Supprimer un pointage
  const handleDelete = async (id?: number) => {
    if (!id) return;

    try {
      await timeRecordService.delete(id);
      setPointages(pointages.filter(item => item.id !== id));
      toast.success("Pointage supprimé avec succès");
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      if (err.response && err.response.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error("Erreur lors de la suppression du pointage");
      }
    }
  };

  // Afficher le statut de pointage avec couleur
  const getPointageStatusBadge = (status: string) => {
    let colorClass = '';
    switch (status) {
      case 'Présent':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        break;
      case 'Retard':
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        break;
      case 'Absent':
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        break;
      case 'Congé':
        colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        break;
      case 'Mission':
        colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
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

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/protected/gestion-temps')}
            className="flex items-center space-x-2"
          >
            <span>Retour</span>
          </Button>
          <h1 className="text-2xl font-bold">Gestion des Pointages</h1>
        </div>
        <Button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold"
          onClick={() => router.push('/protected/gestion-temps/pointage/add')}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau Pointage
        </Button>
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
              <option value="Présent">Présent</option>
              <option value="Retard">Retard</option>
              <option value="Absent">Absent</option>
              <option value="Congé">Congé</option>
              <option value="Mission">Mission</option>
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
            {loading ? 'Chargement des données...' : `${filteredPointages.length} entrée(s) trouvée(s)`}
          </div>
        </div>
      </div>

      {/* Affichage d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erreur ! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Tableau des pointages */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-b-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow className="dark:border-gray-600">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collaborateur</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entrée</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sortie</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Justification</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : getPaginatedData().length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Aucune entrée trouvée
                </TableCell>
              </TableRow>
            ) : (
              getPaginatedData().map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.collaborateurNom}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.date}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.heureEntree || 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.heureSortie || 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.totalHeures !== undefined ? `${item.totalHeures}h` : 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getPointageStatusBadge(item.statut)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {item.justification || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push(`/protected/gestion-temps/pointage/edit/${item.id}`)}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
                        title="Modifier"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && filteredPointages.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredPointages.length / itemsPerPage)}
          totalItems={filteredPointages.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={setItemsPerPage}
          className="mt-6"
        />
      )}
    </div>
  );
}