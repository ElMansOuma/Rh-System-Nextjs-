"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
import Link from 'next/link';
import { Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download, Eye } from "lucide-react";
import { Notification } from '@/components/Notification';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner";
import contratService from '@/services/contratService';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';
import { Contrat } from '@/types/Contrat';

export default function ContratsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [contrats, setContrats] = useState<(Contrat & { collaborateur?: Collaborateur })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Actif' | 'Expiré' | 'Résilié'>('Tous');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  // Close notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Check for operation status from URL params (after redirect from add/edit page)
  useEffect(() => {
    const operation = searchParams.get('operation');
    const status = searchParams.get('status');

    if (operation && status === 'success') {
      let message = '';

      switch (operation) {
        case 'add':
          message = 'Le contrat a été ajouté avec succès';
          break;
        case 'edit':
          message = 'Le contrat a été modifié avec succès';
          break;
        default:
          break;
      }

      if (message) {
        showNotification('success', message);

        // Remove query params from URL without refreshing page
        const url = new URL(window.location.href);
        url.searchParams.delete('operation');
        url.searchParams.delete('status');
        window.history.replaceState({}, document.title, url.pathname);
      }
    }
  }, [searchParams]);

  // Fetch contrats
  useEffect(() => {
    const fetchContrats = async () => {
      try {
        setLoading(true);
        const data = await contratService.getAll();

        // Récupérer les informations des collaborateurs pour chaque contrat
        const contratsWithCollaborateurs = await Promise.all(
          data.map(async (contrat: Contrat) => {
            try {
              const collaborateur = await collaborateurService.getById(contrat.collaborateurId);
              return { ...contrat, collaborateur };
            } catch (error) {
              console.error(`Erreur lors de la récupération du collaborateur ${contrat.collaborateurId}:`, error);
              return contrat;
            }
          })
        );

        setContrats(contratsWithCollaborateurs);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des contrats:', err);
        setError('Impossible de charger les contrats. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchContrats();
  }, []);

  // Filtered contrats based on search and filter
  const filteredContrats = useMemo(() => {
    return contrats.filter(contrat => {
      const collaborateurName = `${contrat.collaborateur?.prenom || ''} ${contrat.collaborateur?.nom || ''}`.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        collaborateurName.includes(searchTerm.toLowerCase()) ||
        contrat.typeContrat.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'Tous' || contrat.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contrats, searchTerm, statusFilter]);

  // Handle delete contrat
  const handleDeleteContrat = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      try {
        await contratService.delete(id);
        setContrats(contrats.filter(contrat => contrat.id !== id));

        // Show success toast
        toast.success('Contrat supprimé avec succès');

        // Update pagination if needed
        if (paginatedContrats.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error('Erreur lors de la suppression du contrat:', err);
        // Show error toast
        toast.error('Impossible de supprimer le contrat. Veuillez réessayer plus tard.');
      }
    }
  };

  // Handle document download
  const handleDownloadDocument = async (id: number) => {
    try {
      await contratService.downloadDocument(id);
    } catch (err) {
      console.error('Erreur lors du téléchargement du document:', err);
      toast.error('Impossible de télécharger le document. Veuillez réessayer plus tard.');
    }
  };

  // Handle view details
  const handleViewDetails = (id: number) => {
    router.push(`/contrats/details/${id}`);
  };

  // Calculate total items and pages
  const totalItems = filteredContrats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Paginated contrats
  const paginatedContrats = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredContrats.slice(startIndex, endIndex);
  }, [filteredContrats, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Items per page options
  const itemsPerPageOptions = [5, 10, 15, 20, 30];

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Notification component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des Contrats</h1>
        <Link
          href="/contrats/add"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ajouter un Contrat
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="flex space-x-4 mb-6">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Rechercher des contrats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        </div>

        <div className="w-48">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Tous' | 'Actif' | 'Expiré' | 'Résilié')}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Expiré">Expiré</option>
              <option value="Résilié">Résilié</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-300 font-medium">
            {loading ? 'Chargement des contrats...' : `${totalItems} contrat(s) trouvé(s)`}
          </div>

          {/* Items per page selector */}
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

      <div className={`bg-white dark:bg-gray-800 shadow-md ${!loading && totalPages > 0 ? 'rounded-b-lg' : 'rounded-lg'} overflow-hidden`}>
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow className="dark:border-gray-600">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collaborateur</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type de contrat</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date début</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date fin</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Salaire base</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : paginatedContrats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Aucun contrat trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedContrats.map((contrat) => (
                <TableRow key={contrat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                    {contrat.collaborateur ?
                      `${contrat.collaborateur.prenom} ${contrat.collaborateur.nom}` :
                      `Collaborateur ID: ${contrat.collaborateurId}`}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{contrat.typeContrat}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{new Date(contrat.dateDebut).toLocaleDateString()}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {contrat.dateFin ? new Date(contrat.dateFin).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{contrat.salaireBase.toLocaleString()} DH</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      contrat.status === 'Actif'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : contrat.status === 'Expiré'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {contrat.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      {/* View button */}
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                        onClick={() => handleViewDetails(contrat.id!)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Edit link */}
                      <Link
                        href={`/contrats/edit/${contrat.id}`}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {/* Download button */}
                      {contrat.documentUrl && (
                        <button
                          className="h-8 w-8 rounded-full flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
                          onClick={() => handleDownloadDocument(contrat.id!)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete button */}
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                        onClick={() => handleDeleteContrat(contrat.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600 flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="subtle"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-8 px-2 py-0 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Première
            </Button>

            <Button
              variant="subtle"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-1 rounded-full">
              <span className="text-sm text-blue-600 dark:text-blue-300">
                <span className="font-bold">{currentPage}</span>
                <span className="mx-1 opacity-70">/</span>
                <span>{totalPages}</span>
              </span>
            </div>

            <Button
              variant="subtle"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="subtle"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 px-2 py-0 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Dernière
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}