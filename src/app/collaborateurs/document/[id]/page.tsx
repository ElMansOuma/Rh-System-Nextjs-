"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import collaborateurService from '@/services/collaborateurService';
import documentService, { Document } from '@/services/documentService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Upload, File, FileText, ArrowLeft, Trash2, Eye, Download, User, Briefcase, Phone, Mail, Calendar, CreditCard, Hash, Search } from 'lucide-react';

// Composant Select pour le téléchargement de documents
const Select: React.FC<{
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  children: React.ReactNode;
}> = ({
        label,
        value,
        onChange,
        required,
        children
      }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-md h-10 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        {children}
      </select>
    </div>
  );
};

export default function CollaborateurDetailPage() {
  const router = useRouter();
  const params = useParams();
  const collaborateurId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [collaborateur, setCollaborateur] = useState<any>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // États pour la gestion des documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Charger les données du collaborateur et ses documents au chargement de la page
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await collaborateurService.getById(collaborateurId);

        // Formater les dates pour l'affichage
        if (data.dateNaissance) {
          data.dateNaissance = data.dateNaissance.split('T')[0];
        }
        if (data.dateEmbauche) {
          data.dateEmbauche = data.dateEmbauche.split('T')[0];
        }

        setCollaborateur(data);

        // Définir l'URL de la photo actuelle
        if (data.id) {
          setCurrentPhotoUrl(`http://localhost:8080/api/collaborateurs/${data.id}/photo`);
        }

        // Récupérer les documents du collaborateur
        const documentsData = await documentService.getDocumentsByCollaborateur(collaborateurId);
        setDocuments(documentsData);
        setFilteredDocuments(documentsData);

        setErrorMessage(null);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrorMessage('Impossible de charger les informations du collaborateur ou ses documents. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    }

    if (collaborateurId) {
      loadData();
    }
  }, [collaborateurId]);

  // Effet pour filtrer les documents lorsque la recherche change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = documents.filter(doc =>
      doc.name.toLowerCase().includes(query) ||
      doc.type.toLowerCase().includes(query)
    );

    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  // Fonctions pour la gestion des documents
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !documentType) {
      setErrorMessage('Veuillez sélectionner un fichier et un type de document');
      return;
    }

    try {
      setUploadingFile(true);
      setErrorMessage(null);

      // Télécharger le document en utilisant le service
      const newDocument = await documentService.uploadDocument(
        collaborateurId,
        selectedFile,
        documentType
      );

      // Ajouter le nouveau document à la liste
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);

      // Mettre à jour la liste filtrée également
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (newDocument.name.toLowerCase().includes(query) || newDocument.type.toLowerCase().includes(query)) {
          setFilteredDocuments([...filteredDocuments, newDocument]);
        }
      } else {
        setFilteredDocuments(updatedDocuments);
      }

      // Réinitialiser le formulaire
      setSelectedFile(null);
      setDocumentType('');

      // Afficher le message de succès
      setSuccessMessage('Document téléchargé avec succès');

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000);

      // Réinitialiser l'input de fichier
      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      setErrorMessage('Impossible de télécharger le document. Veuillez réessayer.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleViewDocument = async (documentId: number) => {
    try {
      await documentService.viewDocument(documentId);
    } catch (error) {
      console.error('Erreur lors de l\'affichage du document:', error);
      setErrorMessage('Impossible d\'afficher le document');
    }
  };

  const handleDownloadDocument = async (documentId: number) => {
    try {
      await documentService.downloadDocument(documentId);
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      setErrorMessage('Impossible de télécharger le document');
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await documentService.deleteDocument(documentId);

        // Supprimer le document de la liste locale
        const updatedDocuments = documents.filter(doc => doc.id !== documentId);
        setDocuments(updatedDocuments);

        // Mettre à jour également la liste filtrée
        setFilteredDocuments(filteredDocuments.filter(doc => doc.id !== documentId));

        setSuccessMessage('Document supprimé avec succès');

        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur lors de la suppression du document:', error);
        setErrorMessage('Impossible de supprimer le document');
      }
    }
  };

  // Fonction pour gérer la recherche
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Détails du Collaborateur</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex justify-center items-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-700 dark:text-gray-300">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/collaborateurs')}
          className="mr-4 text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
        </Button>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dossier Collaborateur
          {collaborateur && ` : ${collaborateur.prenom} ${collaborateur.nom}`}
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}


      {/* Informations du collaborateur */}
      {collaborateur && (
        <>
          {/* Photo de profil */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="flex justify-center">
              {currentPhotoUrl ? (
                <img
                  src={currentPhotoUrl}
                  alt={`${collaborateur.prenom} ${collaborateur.nom}`}
                  className="w-40 h-40 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-profile.png'; // Image de secours
                  }}
                />
              ) : (
                <div className="w-40 h-40 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User size={60} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* Informations personnelles de base */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informations Personnelles de Base</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Matricule</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.matricule || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Prénom</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.prenom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nom</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sexe</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.sexe}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">CIN</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.cin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date de Naissance</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(collaborateur.dateNaissance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Statut</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    collaborateur.status === 'Actif'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {collaborateur.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Coordonnées</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Numéro de Téléphone</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.telephone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Election de Domicile</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.electionDomicile || '-'}</p>
              </div>
            </div>
          </div>

          {/* Situation Familiale */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Situation Familiale</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Situation Familiale</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.situationFamiliale || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre de Personnes à Charge (Enfants)</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.nombrePersonnesACharge || '0'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">CNSS</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.cnss || '-'}</p>
              </div>
            </div>
          </div>

          {/* Détails Professionnels */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Détails Professionnels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre d{"'"}Années d{"'"}Expérience</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.nombreAnneeExperience || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Niveau de Qualification ou Diplôme Obtenu</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.niveauQualification || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Titre du Poste Occupé</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.titrePosteOccupe || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">RIB</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.rib || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Situation dans l{"'"}Entreprise</p>
                <p className="font-medium text-gray-900 dark:text-white">{collaborateur.situationEntreprise || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date d{"'"}Embauche</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(collaborateur.dateEmbauche)}</p>
              </div>
            </div>

            {collaborateur.tachesAccomplies && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tâches Accomplies</p>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  {collaborateur.tachesAccomplies}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {/* Section de téléchargement de documents en haut */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Ajouter une pièce justificative
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Type de Document"
                value={documentType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setDocumentType(e.target.value)}
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="Contrat">Contrat</option>
                <option value="CV">CV</option>
                <option value="Document officiel">Document officiel</option>
                <option value="Rapport d'évaluation">Rapport d{"'"}évaluation</option>
                <option value="Certificat">Certificat</option>
                <option value="Autre">Autre</option>
              </Select>
            </div>

            <div className="flex items-end">
              <input
                type="file"
                id="document-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="document-upload"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-white mr-4 flex items-center h-10"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : "Parcourir..."}
              </label>

              <Button
                type="submit"
                disabled={uploadingFile || !selectedFile}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploadingFile ? "Téléchargement..." : "Télécharger"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Liste des documents avec barre de recherche */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Documents ({documents.length})
          </h2>

          {/* Barre de recherche */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher un document..."
              className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none
                         focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <span className="text-xl">&times;</span>
              </button>
            )}
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {documents.length === 0
              ? "Aucun document disponible pour ce collaborateur."
              : "Aucun document ne correspond à votre recherche."}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700">
              <TableRow className="dark:border-gray-600">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nom du Document
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date d{"'"}Ajout
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Taille
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 dark:text-white">{document.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {document.type}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {document.date}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {document.size}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      {/* View button - no border */}
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                        title="Visualiser"
                        onClick={() => handleViewDocument(document.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Download button - no border */}
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
                        title="Télécharger"
                        onClick={() => handleDownloadDocument(document.id)}
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      {/* Delete button - no border */}
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                        title="Supprimer"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Bouton de retour */}
      <div className="flex justify-end space-x-4 mb-8">
        <Button
          onClick={() => router.push('/collaborateurs')}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          Retour à la liste
        </Button>
      </div>
    </div>
  );
}