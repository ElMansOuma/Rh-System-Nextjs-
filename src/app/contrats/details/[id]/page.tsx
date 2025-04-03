'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import contratService from '@/services/contratService';
import collaborateurService from '@/services/collaborateurService';
import documentService from '@/services/documentService';
import {
  Upload,
  File,
  FileText,
  ArrowLeft,
  Trash2,
  Eye,
  Download,
  User,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Hash,
  Search,
  Home,
  Users,
  Banknote
} from 'lucide-react';

// Composant pour les cartes d'information
const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-md mr-3">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

// Composant pour les champs d'information
const InfoField: React.FC<{
  label: string;
  value: string | number | undefined;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <div className="flex items-start mb-3">
      <div className="w-40 text-gray-500 dark:text-gray-400 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <span>{label}</span>
      </div>

      <div className="flex-1 font-medium text-gray-800 dark:text-gray-200">
        {value || '-'}
      </div>
    </div>
  );
};

export default function ContratDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contratId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [contrat, setContrat] = useState<any>(null);
  const [collaborateur, setCollaborateur] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // États pour la gestion des documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Charger les données du contrat et ses documents au chargement de la page
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Récupérer les détails du contrat
        const contratData = await contratService.getById(contratId);

        // Formater les dates pour l'affichage
        if (contratData.dateEmbauche) {
          contratData.dateEmbauche = contratData.dateEmbauche.split('T')[0];
        }
        if (contratData.dateDebut) {
          contratData.dateDebut = contratData.dateDebut.split('T')[0];
        }
        if (contratData.dateFin) {
          contratData.dateFin = contratData.dateFin.split('T')[0];
        }

        setContrat(contratData);

        // Récupérer les informations du collaborateur associé
        if (contratData.collaborateurId) {
          const collaborateurData = await collaborateurService.getById(contratData.collaborateurId);
          setCollaborateur(collaborateurData);
        }

        // Récupérer les documents associés au contrat
        const documentsData = await documentService.getDocumentsByCollaborateur(contratId);
        setDocuments(documentsData);
        setFilteredDocuments(documentsData);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrorMessage('Impossible de charger les données du contrat.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [contratId]);

        // Fonctions pour la gestion des documents
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
            setErrorMessage(null);

            // Télécharger le document en utilisant le service
            const newDocument = await documentService.uploadDocument(
              contratId,
              selectedFile,
              documentType,
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
              const updatedDocuments = documents.filter((doc: any) => doc.id !== documentId);
              setDocuments(updatedDocuments);

              // Mettre à jour également la liste filtrée
              setFilteredDocuments(filteredDocuments.filter((doc: any) => doc.id !== documentId));

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
        const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        // Fonction pour formater les montants en dirhams
        const formatMontant = (montant: number | undefined) => {
          if (montant === undefined || montant === null) return '-';
          return `${montant.toLocaleString('fr-FR')} DH`;
        };

        if (isLoading) {
          return (
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <Button
                  onClick={() => router.push('/contrats')}
                  className="mr-4 text-gray-600 dark:text-gray-300"
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>

                <h1 className="text-2xl font-bold">Détails du Contrat</h1>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-center items-center h-64">
                <p className="text-xl text-gray-500 dark:text-gray-400">Chargement des données...</p>
              </div>
            </div>
          );
        }

        return (
          <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Fil d'Ariane */}
            <div className="flex items-center mb-6">
              <Button
                onClick={() => router.push('/contrats')}
                className="mr-4 text-gray-600 dark:text-gray-300"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>

              <h1 className="text-1.9xl font-bold flex-1">
                Contrat
                {contrat && ` : ${contrat.numeroContrat || 'Sans numéro'}`}
                {contrat && collaborateur && ` - ${collaborateur.prenom} ${collaborateur.nom}`}
              </h1>

              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                contrat?.status === 'Actif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  contrat?.status === 'Expiré' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {contrat?.status || 'Non défini'}
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
                <div className="flex items-center">
                  <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 20 20">
                      <path
                        d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Erreur</p>
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
                <div className="flex items-center">
                  <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg"
                         viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Succès</p>
                    <p className="text-sm">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Informations du contrat */}
            {contrat && (
              <>
                {/* En-tête avec les informations du collaborateur */}
                {collaborateur && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row">
                      {/* Photo du collaborateur à gauche */}
                      <div className="md:w-1/4 mb-4 md:mb-0 flex flex-col items-center">
                        <div
                          className="w-32 h-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          {collaborateur.id ? (
                            <img
                              src={`http://localhost:8080/api/collaborateurs/${collaborateur.id}/photo`}
                              alt={`${collaborateur.prenom} ${collaborateur.nom}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-profile.png';
                              }}
                            />
                          ) : (
                            <User className="w-16 h-16 text-gray-400" />
                          )}
                        </div>

                        {collaborateur.status && (
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            collaborateur.status === 'Actif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {collaborateur.status}
                          </div>
                        )}
                      </div>

                      {/* Informations personnelles essentielles à droite */}
                      <div className="md:w-3/4 md:pl-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                          {collaborateur.prenom} {collaborateur.nom}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {collaborateur.matricule && (
                            <div className="flex items-center">
                              <Hash className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="text-gray-800 dark:text-gray-200">{collaborateur.matricule}</span>
                            </div>
                          )}

                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-800 dark:text-gray-200">
                        {collaborateur.titrePosteOccupe || 'Poste non spécifié'}
                      </span>
                          </div>

                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-800 dark:text-gray-200">
                        {collaborateur.telephone || 'Téléphone non spécifié'}
                      </span>
                          </div>

                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-800 dark:text-gray-200">
                        {collaborateur.email || 'Email non spécifié'}
                      </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Informations de base */}
                  <InfoCard
                    title="Informations de Base"
                    icon={<Briefcase className="w-5 h-5 text-blue-500 dark:text-blue-300" />}
                  >
                    <InfoField
                      label="Numéro de contrat"
                      value={contrat.numeroContrat}
                      icon={<Hash className="w-4 h-4" />}
                    />
                    <InfoField
                      label="Type de contrat"
                      value={contrat.typeContrat}
                      icon={<FileText className="w-4 h-4" />}
                    />
                    <InfoField
                      label="Poste"
                      value={contrat.poste}
                      icon={<Briefcase className="w-4 h-4" />}
                    />
                    <InfoField
                      label="Date d'embauche"
                      value={formatDate(contrat.dateEmbauche)}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    <InfoField
                      label="Date de début"
                      value={formatDate(contrat.dateDebut)}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    {contrat.dateFin && (
                      <InfoField
                        label="Date de fin"
                        value={formatDate(contrat.dateFin)}
                        icon={<Calendar className="w-4 h-4" />}
                      />
                    )}
                    <InfoField
                      label="Statut"
                      value={contrat.status}
                      icon={<Hash className="w-4 h-4" />}
                    />
                  </InfoCard>

                  {/* Rémunération */}
                  <InfoCard
                    title="Rémunération"
                    icon={<Banknote className="w-5 h-5 text-blue-500 dark:text-blue-300" />}
                  >
                    <InfoField
                      label="Salaire de base"
                      value={formatMontant(contrat.salaireBase)}
                      icon={<CreditCard className="w-4 h-4" />}
                    />
                    <InfoField
                      label="Ancienneté"
                      value={contrat.anciennete ? `${contrat.anciennete} années` : '-'}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    <InfoField
                      label="Mode de paiement"
                      value={contrat.modeEnPaiement}
                      icon={<CreditCard className="w-4 h-4" />}
                    />
                  </InfoCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Primes */}
                  <InfoCard
                    title="Primes"
                    icon={<CreditCard className="w-5 h-5 text-blue-500 dark:text-blue-300" />}
                  >
                    <InfoField
                      label="Prime transport"
                      value={formatMontant(contrat.primeTransport)}
                    />
                    <InfoField
                      label="Prime panier"
                      value={formatMontant(contrat.primePanier)}
                    />
                    <InfoField
                      label="Prime représentation"
                      value={formatMontant(contrat.primeRepresentation)}
                    />
                    <InfoField
                      label="Prime responsabilité"
                      value={formatMontant(contrat.primeResponsabilite)}
                    />
                    <InfoField
                      label="Autres primes"
                      value={formatMontant(contrat.autresPrimes)}
                    />
                  </InfoCard>

                  {/* Indemnités */}
                  <InfoCard
                    title="Indemnités"
                    icon={<CreditCard className="w-5 h-5 text-blue-500 dark:text-blue-300" />}
                  >
                    <InfoField
                      label="Indemnités KM"
                      value={formatMontant(contrat.indemnitesKilometriques)}
                    />
                    <InfoField
                      label="Note de frais"
                      value={formatMontant(contrat.noteDeFrais)}
                    />

                    {contrat.avantages && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">
                          Avantages
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {contrat.avantages}
                        </p>
                      </div>
                    )}
                  </InfoCard>
                </div>

                {/* Retenues */}
                <InfoCard
                  title="Retenues"
                  icon={<CreditCard className="w-5 h-5 text-blue-500 dark:text-blue-300" />}
                  className="mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoField
                      label="IR"
                      value={formatMontant(contrat.ir)}
                    />
                    <InfoField
                      label="CNSS"
                      value={formatMontant(contrat.cnss)}
                    />
                    <InfoField
                      label="CIMR"
                      value={formatMontant(contrat.cimr)}
                    />
                    <InfoField
                      label="Mutuelle"
                      value={formatMontant(contrat.mutuelle)}
                    />
                    <InfoField
                      label="Retraite"
                      value={formatMontant(contrat.retraite)}
                    />
                  </div>
                </InfoCard>
              </>
            )}
          </div>
        );
      }