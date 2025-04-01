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
import { UserPlus, Edit, Trash2, Search, Filter, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';

export default function Page() {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Actif' | 'Inactif'>('Tous');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
<<<<<<< HEAD
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

=======
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default to 5 items per page
  const [totalItems, setTotalItems] = useState(0);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

>>>>>>> cf0ce64 (Initial commit)
  // Fetch collaborateurs
  useEffect(() => {
    const fetchCollaborateurs = async () => {
      try {
        setLoading(true);
        let data;

        if (searchTerm || statusFilter !== 'Tous') {
          // Use search endpoint if filters are applied
          data = await collaborateurService.search(searchTerm, statusFilter !== 'Tous' ? statusFilter : undefined);
        } else {
          // Otherwise get all collaborateurs
          data = await collaborateurService.getAll();
        }

        setCollaborateurs(data);
        setTotalItems(data.length);
<<<<<<< HEAD
        setTotalPages(Math.ceil(data.length / itemsPerPage));
=======
>>>>>>> cf0ce64 (Initial commit)
        setError(null);
      } catch (err) {
        console.error('Failed to fetch collaborateurs:', err);
        setError('Impossible de charger les collaborateurs. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborateurs();
<<<<<<< HEAD
=======
  }, [searchTerm, statusFilter]);

  // Reset to first page when changing search/filter or items per page
  useEffect(() => {
    setCurrentPage(1);
>>>>>>> cf0ce64 (Initial commit)
  }, [searchTerm, statusFilter, itemsPerPage]);

  // Handle delete collaborateur
  const handleDeleteCollaborateur = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce collaborateur ?')) {
      try {
        await collaborateurService.delete(id);
<<<<<<< HEAD
        setCollaborateurs(collaborateurs.filter(collab => collab.id !== id));
=======
        const updatedCollabs = collaborateurs.filter(collab => collab.id !== id);
        setCollaborateurs(updatedCollabs);
        setTotalItems(updatedCollabs.length);
>>>>>>> cf0ce64 (Initial commit)

        // Update pagination if needed
        if (paginatedCollaborateurs.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error('Failed to delete collaborateur:', err);
        alert('Impossible de supprimer le collaborateur. Veuillez réessayer plus tard.');
      }
    }
  };

  // Handle document view
  const handleViewDocument = (id: number) => {
    // Navigate to detail view
    window.location.href = `/collaborateurs/document/${id}`;
  };

  // Paginated collaborateurs
  const paginatedCollaborateurs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return collaborateurs.slice(startIndex, endIndex);
  }, [collaborateurs, currentPage, itemsPerPage]);

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
<<<<<<< HEAD
=======
      // Scroll to top of table when changing page
      document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth' });
>>>>>>> cf0ce64 (Initial commit)
    }
  };

  // Items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

<<<<<<< HEAD
=======
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    let pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex logic for showing pages around current page
      let startPage, endPage;

      if (currentPage <= Math.floor(maxVisiblePages / 2) + 1) {
        // Current page is near the start
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
        // Current page is near the end
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        // Current page is in the middle
        startPage = currentPage - Math.floor(maxVisiblePages / 2);
        endPage = currentPage + Math.floor(maxVisiblePages / 2);
      }

      // Generate page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis indicators
      if (startPage > 1) {
        pages.unshift('ellipsis-start');
        pages.unshift(1);
      }

      if (endPage < totalPages) {
        pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }

    return pages;
  };

>>>>>>> cf0ce64 (Initial commit)
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Liste des Collaborateurs</h1>
        <Link href="/collaborateurs/add">
          <Button
<<<<<<< HEAD
            className="flex items-center gap-2 rounded-full bg-blue-400 hover:bg-blue-300 text-white px-4 py-2"
=======
            className="flex items-center gap-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white px-4 py-2"
>>>>>>> cf0ce64 (Initial commit)
          >
            <UserPlus className="w-5 h-5" />
            Ajouter un Collaborateur
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search and Filter Section */}
<<<<<<< HEAD
      <div className="flex space-x-4 mb-6">
=======
      <div className="flex flex-col md:flex-row gap-4 mb-6">
>>>>>>> cf0ce64 (Initial commit)
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Rechercher des collaborateurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        </div>

<<<<<<< HEAD
        <div className="w-48">
=======
        <div className="w-full md:w-48">
>>>>>>> cf0ce64 (Initial commit)
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Tous' | 'Actif' | 'Inactif')}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Results Summary */}
      <div className="mb-4 text-gray-600 dark:text-gray-300">
        {loading ? 'Chargement des collaborateurs...' : `${totalItems} collaborateur(s) trouvé(s)`}
=======
      {/* Results Summary and Items Per Page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div className="text-gray-600 dark:text-gray-300 mb-2 md:mb-0">
          {loading ? 'Chargement des collaborateurs...' : `${totalItems} collaborateur(s) trouvé(s)`}
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <span>Afficher</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>par page</span>
        </div>
>>>>>>> cf0ce64 (Initial commit)
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow className="dark:border-gray-600">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Photo</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Matricule</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom Complet</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Poste</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
<<<<<<< HEAD
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : paginatedCollaborateurs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
=======
              Array(itemsPerPage).fill(0).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="animate-pulse dark:border-gray-600">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-40"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-end space-x-2">
                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-600"></div>
                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-600"></div>
                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedCollaborateurs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
>>>>>>> cf0ce64 (Initial commit)
                  Aucun collaborateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedCollaborateurs.map((collaborateur) => (
                <TableRow key={collaborateur.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {collaborateur.id ? (
                        <img
                          src={`http://localhost:8080/api/collaborateurs/${collaborateur.id}/photo`}
                          alt={`${collaborateur.prenom} ${collaborateur.nom}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-profile.png'; // Fallback image
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span>N/A</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{collaborateur.matricule || 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{`${collaborateur.prenom} ${collaborateur.nom}`}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{collaborateur.email}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{collaborateur.titrePosteOccupe || 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      collaborateur.status === 'Actif'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {collaborateur.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-300"
                        onClick={() => handleViewDocument(collaborateur.id!)}
<<<<<<< HEAD
=======
                        title="Voir document"
>>>>>>> cf0ce64 (Initial commit)
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Link href={`/collaborateurs/edit/${collaborateur.id}`}>
<<<<<<< HEAD
                        <Button variant="outline" className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
=======
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          title="Modifier"
                        >
>>>>>>> cf0ce64 (Initial commit)
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300"
                        onClick={() => handleDeleteCollaborateur(collaborateur.id!)}
<<<<<<< HEAD
=======
                        title="Supprimer"
>>>>>>> cf0ce64 (Initial commit)
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
<<<<<<< HEAD
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Afficher</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>par page</span>
          </div>

          <div className="flex items-center space-x-1">
=======
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} collaborateurs
          </div>

          <div className="flex items-center space-x-1">

>>>>>>> cf0ce64 (Initial commit)
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
<<<<<<< HEAD
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Calculate page numbers to show centered around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              // Only render if pageNum is valid
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-8 w-8 p-0 ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white dark:bg-blue-600"
                        : "dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
=======
              title="Page précédente"
            >
              <span className="sr-only">Page précédente</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="h-8 w-8 flex items-center justify-center text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={`page-${pageNum}`}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => handlePageChange(pageNum as number)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === pageNum
                      ? "bg-blue-500 text-white dark:bg-blue-600"
                      : "dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                  }`}
                >
                  {pageNum}
                </Button>
              );
>>>>>>> cf0ce64 (Initial commit)
            })}

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
<<<<<<< HEAD
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
=======
              title="Page suivante"
            >
              <span className="sr-only">Page suivante</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

>>>>>>> cf0ce64 (Initial commit)
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} sur {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}