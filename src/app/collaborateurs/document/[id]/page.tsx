"use client";

import React, { useState, useEffect } from 'react';
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
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, File, FileText, ArrowLeft, Trash2, Eye, Download } from 'lucide-react';
import collaborateurService from '@/services/collaborateurService';
import documentService, { Document } from '@/services/documentService';

export default function CollaborateurDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const collaborateurId = Number(params.id);

  const [collaborateur, setCollaborateur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Récupérer les informations du collaborateur
        const collaborateurData = await collaborateurService.getById(collaborateurId);
        setCollaborateur(collaborateurData);

        // Récupérer les documents du collaborateur depuis l'API
        const documentsData = await documentService.getDocumentsByCollaborateur(collaborateurId);
        setDocuments(documentsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrorMessage('Impossible de charger les informations du collaborateur ou ses documents');
      } finally {
        setLoading(false);
      }
    }

    if (collaborateurId) {
      fetchData();
    }
  }, [collaborateurId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !documentType) {
      setErrorMessage('Veuillez sélectionner un fichier et un type de document');
      return;
    }

    try {
      setUploadingFile(true);
      setErrorMessage('');

      // Télécharger le document en utilisant le service
      const newDocument = await documentService.uploadDocument(
        collaborateurId,
        selectedFile,
        documentType
      );

      // Ajouter le nouveau document à la liste
      setDocuments([...documents, newDocument]);

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
        setDocuments(documents.filter(doc => doc.id !== documentId));
        setSuccessMessage('Document supprimé avec succès');

        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erreur lors de la suppression du document:', error);
        setErrorMessage('Impossible de supprimer le document');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/collaborateurs')}
          className="mr-4 text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Documents du Collaborateur
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

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement en cours...</p>
        </div>
      ) : (
        <>
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Télécharger un Nouveau Document
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de Document
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="Contrat">Contrat</option>
                    <option value="CV">CV</option>
                    <option value="Document officiel">Document officiel</option>
<<<<<<< HEAD
                    <option value="Rapport d'évaluation">Rapport d'évaluation</option>
=======
                    <option value="Rapport d'évaluation">Rapport d{"'"}évaluation</option>
>>>>>>> cf0ce64 (Initial commit)
                    <option value="Certificat">Certificat</option>
                    <option value="Autre">Autre</option>
                  </select>
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
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-white mr-4 flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? selectedFile.name : "Parcourir..."}
                  </label>

                  <Button
                    type="submit"
                    disabled={uploadingFile || !selectedFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                  >
                    {uploadingFile ? "Téléchargement..." : "Télécharger"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Documents List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
              Documents ({documents.length})
            </h2>

            {documents.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Aucun document disponible pour ce collaborateur.
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
<<<<<<< HEAD
                      Date d'Ajout
=======
                      Date d{"'"}Ajout
>>>>>>> cf0ce64 (Initial commit)
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
                  {documents.map((document) => (
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
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-300"
                            title="Visualiser"
                            onClick={() => handleViewDocument(document.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-green-900 dark:hover:text-green-300"
                            title="Télécharger"
                            onClick={() => handleDownloadDocument(document.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300"
                            onClick={() => handleDeleteDocument(document.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}