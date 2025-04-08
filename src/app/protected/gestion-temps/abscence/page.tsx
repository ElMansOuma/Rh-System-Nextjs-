// src/app/protected/gestion-temps/abscence/page.tsx
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
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner";
import absenceService, { Absence } from '@/services/absenceService';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';

// Fonction utilitaire pour calculer les jours ouvrés
const getBusinessDaysCount = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const currentDate = new Date(startDate);

  // Boucler à travers chaque jour
  while (currentDate <= endDate) {
    // Ignorer les weekend (0 = dimanche, 6 = samedi)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }

    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

export default function AbsencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [absences, setAbsences] = useState<(Absence & { collaborateur?: Collaborateur, joursOuvres?: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'En attente' | 'Approuvée' | 'Rejetée'>('Tous');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch absences
  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        setLoading(true);
        const data = await absenceService.getAll();

        // Récupérer les informations des collaborateurs pour chaque absence
        const absencesWithDetails = await Promise.all(
          data.map(async (absence: Absence) => {
            try {
              const collaborateur = await collaborateurService.getById(absence.collaborateurId);

              // Calculer les jours ouvrés
              const startDate = new Date(absence.dateDebut);
              const endDate = new Date(absence.dateFin);
              const joursOuvres = getBusinessDaysCount(startDate, endDate);

              return { ...absence, collaborateur, joursOuvres };
            } catch (error) {
              console.error(`Erreur lors de la récupération du collaborateur ${absence.collaborateurId}:`, error);
              return { ...absence, joursOuvres: 0 };
            }
          })
        );

        setAbsences(absencesWithDetails);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des absences:', err);
        setError('Impossible de charger les absences. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, []);

  // Filtered absences based on search and filter
  const filteredAbsences = useMemo(() => {
    return absences.filter(absence => {
      const collaborateurName = `${absence.collaborateur?.prenom || ''} ${absence.collaborateur?.nom || ''}`.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        collaborateurName.includes(searchTerm.toLowerCase()) ||
        absence.motif.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'Tous' || absence.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [absences, searchTerm, statusFilter]);

  // Handle delete absence
  const handleDeleteAbsence = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      try {
        await absenceService.delete(id);
        setAbsences(absences.filter(absence => absence.id !== id));
        toast.success('Absence supprimée avec succès');
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'absence:', err);
        toast.error('Impossible de supprimer l\'absence. Veuillez réessayer plus tard.');
      }
    }
  };

  // Calculate total items and pages
  const totalItems = filteredAbsences.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Paginated absences
  const paginatedAbsences = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAbsences.slice(startIndex, endIndex);
  }, [filteredAbsences, currentPage, itemsPerPage]);

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

  // Update absence status
  const handleUpdateStatus = async (id: number, newStatus: 'En attente' | 'Approuvée' | 'Rejetée') => {
    try {
      await absenceService.updateStatus(id, newStatus);

      // Update local state
      setAbsences(prevAbsences =>
        prevAbsences.map(absence =>
          absence.id === id ? { ...absence, status: newStatus } : absence
        )
      );

      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Impossible de mettre à jour le statut.');
    }
  };

  // Items per page options
  const itemsPerPageOptions = [5, 10, 15, 20, 30];

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Absences</h1>
        <Link
          href="/protected/gestion-temps/abscence/add"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Déclarer une Absence
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
            placeholder="Rechercher des absences..."
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
              onChange={(e) => setStatusFilter(e.target.value as 'Tous' | 'En attente' | 'Approuvée' | 'Rejetée')}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Approuvée">Approuvée</option>
              <option value="Rejetée">Rejetée</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-t-lg shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-300 font-medium">
            {loading ? 'Chargement des absences...' : `${totalItems} absence(s) trouvée(s)`}
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
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date début</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date fin</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jours ouvrés</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Motif</TableHead>
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
            ) : paginatedAbsences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Aucune absence trouvée
                </TableCell>
              </TableRow>
            ) : (
              paginatedAbsences.map((absence) => (
                <TableRow key={absence.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                    {absence.collaborateur ?
                      `${absence.collaborateur.prenom} ${absence.collaborateur.nom}` :
                      `Collaborateur ID: ${absence.collaborateurId}`}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {new Date(absence.dateDebut).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {new Date(absence.dateFin).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {absence.joursOuvres} jours
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {absence.motif}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      absence.status === 'Approuvée'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : absence.status === 'En attente'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {absence.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Status update dropdown for admin/manager */}
                      {absence.status === 'En attente' && (
                        <div className="dropdown">
                          <select
                            onChange={(e) => handleUpdateStatus(absence.id!, e.target.value as 'En attente' | 'Approuvée' | 'Rejetée')}
                            className="h-8 rounded px-2 text-xs border border-gray-300 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            defaultValue=""
                          >
                            <option value="" disabled>Action</option>
                            <option value="Approuvée">Approuver</option>
                            <option value="Rejetée">Rejeter</option>
                          </select>
                        </div>
                      )}

                      {/* Edit link */}
                      <Link
                        href={`/protected/gestion-temps/abscence/edit/${absence.id}`}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {/* Delete button */}
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                        onClick={() => handleDeleteAbsence(absence.id!)}
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
              variant="outline"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-8 px-2 py-0 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Première
            </Button>

            <Button
              variant="outline"
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
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
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