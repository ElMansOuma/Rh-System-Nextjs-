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
import { UserPlus, Edit, Trash2, Search, Filter, FileText } from 'lucide-react';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';
import Image from 'next/image';

export default function Page() {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Actif' | 'Inactif'>('Tous');

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
        setError(null);
      } catch (err) {
        console.error('Failed to fetch collaborateurs:', err);
        setError('Impossible de charger les collaborateurs. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborateurs();
  }, [searchTerm, statusFilter]);

  // Handle delete collaborateur
  const handleDeleteCollaborateur = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce collaborateur ?')) {
      try {
        await collaborateurService.delete(id);
        setCollaborateurs(collaborateurs.filter(collab => collab.id !== id));
      } catch (err) {
        console.error('Failed to delete collaborateur:', err);
        alert('Impossible de supprimer le collaborateur. Veuillez réessayer plus tard.');
      }
    }
  };

  // Handle document view
  const handleViewDocument = (id: number) => {
    // Navigate to detail view
    window.location.href = `/collaborateurs/detail/${id}`;
  };

  // Filtered collaborateurs - now handled by backend for search and status filter
  const filteredCollaborateurs = useMemo(() => {
    // This is now mainly for local filtering if needed
    return collaborateurs;
  }, [collaborateurs]);

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Liste des Collaborateurs</h1>
        <Link href="/collaborateurs/add">
          <Button
            className="flex items-center gap-2 rounded-full bg-blue-400 hover:bg-blue-300 text-white px-4 py-2"
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
      <div className="flex space-x-4 mb-6">
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

        <div className="w-48">
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

      {/* Results Summary */}
      <div className="mb-4 text-gray-600 dark:text-gray-300">
        {loading ? 'Chargement des collaborateurs...' : `${filteredCollaborateurs.length} collaborateur(s) trouvé(s)`}
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
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredCollaborateurs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Aucun collaborateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredCollaborateurs.map((collaborateur) => (
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
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Link href={`/collaborateurs/edit/${collaborateur.id}`}>
                        <Button variant="outline" className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300"
                        onClick={() => handleDeleteCollaborateur(collaborateur.id!)}
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
    </div>
  );
}