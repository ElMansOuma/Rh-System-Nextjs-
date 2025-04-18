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
import { Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, Download, Calendar, X } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner";
import absenceService, { Absence, MotifAbsence } from "@/services/absenceService";
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

  // Mise à jour de l'interface Absence pour inclure les champs supplémentaires
  const [absences, setAbsences] = useState<(Absence & { collaborateur?: Collaborateur, joursOuvres?: number })[]>([]);
  const [motifs, setMotifs] = useState<MotifAbsence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [motifFilter, setMotifFilter] = useState<number | 'Tous'>('Tous');
  const [yearFilter, setYearFilter] = useState<string>('Tous');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Years for filter dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  // Fetch absences and motifs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer la liste des motifs
        const motifsList = await absenceService.getAllMotifs();
        setMotifs(motifsList);

        // Récupérer les absences
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
        console.error('Erreur lors de la récupération des données:', err);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered absences based on search and filters
  const filteredAbsences = useMemo(() => {
    return absences.filter(absence => {
      const collaborateurName = `${absence.collaborateur?.prenom || ''} ${absence.collaborateur?.nom || ''}`.toLowerCase();

      // Filtre de recherche texte
      const matchesSearch =
        searchTerm === '' ||
        collaborateurName.includes(searchTerm.toLowerCase()) ||
        absence.motif.libelle.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par motif
      const matchesMotif = motifFilter === 'Tous' || absence.motif.id === motifFilter;

      // Filtre par année
      const absenceYear = new Date(absence.dateDebut).getFullYear().toString();
      const matchesYear = yearFilter === 'Tous' || absenceYear === yearFilter;

      return matchesSearch && matchesMotif && matchesYear;
    });
  }, [absences, searchTerm, motifFilter, yearFilter]);

  // Handle delete absence
  const handleDeleteAbsence = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      try {
        await absenceService.delete(id);
        setAbsences(absences.filter(absence => absence.id !== id));
        toast.success('Absence supprimée avec succès');

        // Update pagination if needed
        if (paginatedAbsences.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'absence:', err);
        toast.error('Impossible de supprimer l\'absence. Veuillez réessayer plus tard.');
      }
    }
  };

  // Handle download justificatif
  const handleDownloadJustificatif = async (id: number) => {
    try {
      const blob = await absenceService.downloadJustificatif(id);

      // Trouver l'absence pour obtenir le nom du fichier
      const absence = absences.find(a => a.id === id);
      let filename = absence?.justificatifNom || `justificatif-absence-${id}.pdf`;

      // Créer un URL pour le blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Téléchargement du justificatif réussi');
    } catch (err) {
      console.error('Erreur lors du téléchargement du justificatif:', err);
      toast.error('Impossible de télécharger le justificatif. Veuillez réessayer plus tard.');
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

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setMotifFilter('Tous');
    setYearFilter('Tous');
    setCurrentPage(1);
  };

  // Items per page options
  const itemsPerPageOptions = [5, 10, 15, 20, 30];

  // Vérifie si des filtres sont actifs
  const hasActiveFilters = motifFilter !== 'Tous' || yearFilter !== 'Tous';

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des absences</h1>
        <Link
          href="/protected/gestion-temps/abscence/add"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 shadow-sm"
        >
          Déclarer une absence
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search Input */}
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

        {/* Motif Filter */}
        <div className="w-48">
          <div className="relative">
            <select
              value={typeof motifFilter === 'number' ? motifFilter : 'Tous'}
              onChange={(e) => setMotifFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              <option value="Tous">Tous les motifs</option>
              {motifs.map((motif) => (
                <option key={motif.id} value={motif.id}>{motif.libelle}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
        </div>

        {/* Year Filter */}
        <div className="w-48">
          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              <option value="Tous">Toutes les années</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
        </div>

        {/* Reset Filters Button - shown only when filters are active */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            <X size={16} />
            <span>Réinitialiser les filtres</span>
          </Button>
        )}
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
              <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : paginatedAbsences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
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
                  <TableCell
                    className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300"
                    style={{ color: absence.motif.couleur }}
                  >
                    {absence.motif.libelle}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Edit link */}
                      <Link
                        href={`/protected/gestion-temps/abscence/edit/${absence.id}`}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {/* Download justificatif button */}
                      {absence.justificatifUrl && (
                        <button
                          className="h-8 w-8 rounded-full flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
                          onClick={() => handleDownloadJustificatif(absence.id!)}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}

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
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600 flex justify-center items-center rounded-b-lg mt-0">
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