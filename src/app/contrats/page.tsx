'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contrat } from '@/types/Contrat';
import contratService from '@/services/contratService';
import collaborateurService, { Collaborateur } from '@/services/collaborateurService';

export default function ContratsPage() {
  const [contrats, setContrats] = useState<(Contrat & { collaborateur?: Collaborateur })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchContrats();
  }, []);

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
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      try {
        await contratService.delete(id);
        setContrats(contrats.filter(contrat => contrat.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du contrat:', error);
      }
    }
  };

  const handleDownloadDocument = async (id: number) => {
    try {
      await contratService.downloadDocument(id);
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      alert('Erreur lors du téléchargement du document.');
    }
  };

  const filteredContrats = contrats.filter(contrat => {
    const collaborateurName = `${contrat.collaborateur?.prenom || ''} ${contrat.collaborateur?.nom || ''}`.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      collaborateurName.includes(searchTerm.toLowerCase()) ||
      contrat.typeContrat.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === '' || contrat.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Contrats</h1>
        <Link
          href="/contrats/add"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ajouter un Contrat
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Rechercher..."
          className="p-2 border rounded flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Expiré">Expiré</option>
          <option value="Résilié">Résilié</option>
        </select>
        <button
          onClick={fetchContrats}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <p>Chargement des contrats...</p>
        </div>
      ) : filteredContrats.length === 0 ? (
        <div className="text-center">
          <p>Aucun contrat trouvé.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Collaborateur</th>
              <th className="py-2 px-4 border">Type de contrat</th>
              <th className="py-2 px-4 border">Date début</th>
              <th className="py-2 px-4 border">Date fin</th>
              <th className="py-2 px-4 border">Salaire base</th>
              <th className="py-2 px-4 border">Statut</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredContrats.map((contrat) => (
              <tr key={contrat.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">
                  {contrat.collaborateur ?
                    `${contrat.collaborateur.prenom} ${contrat.collaborateur.nom}` :
                    `Collaborateur ID: ${contrat.collaborateurId}`
                  }
                </td>
                <td className="py-2 px-4 border">{contrat.typeContrat}</td>
                <td className="py-2 px-4 border">{new Date(contrat.dateDebut).toLocaleDateString()}</td>
                <td className="py-2 px-4 border">
                  {contrat.dateFin ? new Date(contrat.dateFin).toLocaleDateString() : 'N/A'}
                </td>
                <td className="py-2 px-4 border">{contrat.salaireBase.toLocaleString()} DH</td>
                <td className="py-2 px-4 border">
                    <span className={`px-2 py-1 rounded text-white ${
                      contrat.status === 'Actif' ? 'bg-green-500' :
                        contrat.status === 'Expiré' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {contrat.status}
                    </span>
                </td>
                <td className="py-2 px-4 border">
                  <div className="flex space-x-2">
                    <Link
                      href={`/contrats/edit/${contrat.id}`}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-2 rounded text-sm"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(contrat.id!)}
                      className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                    >
                      Supprimer
                    </button>
                    {contrat.documentUrl && (
                      <button
                        onClick={() => handleDownloadDocument(contrat.id!)}
                        className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm"
                      >
                        Télécharger
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}