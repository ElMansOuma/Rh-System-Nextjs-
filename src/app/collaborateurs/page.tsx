"use client";
import React, { useState, useMemo } from 'react';
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

interface Collaborateur {
  id: number;
  matricule: string;
  prenom: string;
  nom: string;
  email: string;
  titrePosteOccupe: string;
  status: 'Actif' | 'Inactif';
}

export default function Page() {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([
    {
      id: 1,
      matricule: 'COL001',
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@entreprise.com',
      titrePosteOccupe: 'Développeur Senior',
      status: 'Actif'
    },
    {
      id: 2,
      matricule: 'COL002',
      prenom: 'Marie',
      nom: 'Dupuis',
      email: 'marie.dupuis@entreprise.com',
      titrePosteOccupe: 'Responsable Marketing',
      status: 'Actif'
    },
    {
      id: 3,
      matricule: 'COL003',
      prenom: 'Pierre',
      nom: 'Martin',
      email: 'pierre.martin@entreprise.com',
      titrePosteOccupe: 'Responsable RH',
      status: 'Inactif'
    }
  ]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Actif' | 'Inactif'>('Tous');

  // Handle delete collaborateur
  const handleDeleteCollaborateur = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce collaborateur ?')) {
      setCollaborateurs(collaborateurs.filter(collab => collab.id !== id));
    }
  };

  // Handle document view
  const handleViewDocument = (id: number) => {
    // TODO: Implement document viewing logic
    // This could open a modal, navigate to a document page, or trigger a download
    console.log(`Viewing document for collaborateur with ID: ${id}`);
  };

  // Filtered and searched collaborateurs
  const filteredCollaborateurs = useMemo(() => {
    return collaborateurs.filter(collaborateur => {
      // Search condition
      const matchesSearch =
        collaborateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborateur.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collaborateur.titrePosteOccupe.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter condition
      const matchesStatus =
        statusFilter === 'Tous' ||
        collaborateur.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [collaborateurs, searchTerm, statusFilter]);

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Liste des Collaborateurs</h1>
        <Link href="/collaborateurs/add">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-5 h-5" />
            Ajouter un Collaborateur
          </Button>
        </Link>
      </div>

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
        {filteredCollaborateurs.length} collaborateur(s) trouvé(s)
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow className="dark:border-gray-600">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Matricule</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom Complet</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Poste</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollaborateurs.map((collaborateur) => (
              <TableRow key={collaborateur.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{collaborateur.matricule}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{`${collaborateur.prenom} ${collaborateur.nom}`}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{collaborateur.email}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{collaborateur.titrePosteOccupe}</TableCell>
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
                      onClick={() => handleViewDocument(collaborateur.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Link href={`/collaborateurs/editer/${collaborateur.id}`}>
                      <Button variant="outline" className="h-8 w-8 p-0 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300"
                      onClick={() => handleDeleteCollaborateur(collaborateur.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}