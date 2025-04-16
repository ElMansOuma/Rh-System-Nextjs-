"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import collaborateurService from '@/services/collaborateurService';
import absenceService, { Absence } from '@/services/absenceService';
import contratService from '@/services/contratService';
import { Contrat } from '@/types/Contrat';
import documentService, { Document } from '@/services/documentService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
  Clock,
  BarChart2,
  PieChart,
  AlertCircle
} from 'lucide-react';

// Composant Select amélioré
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
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg h-10 px-3
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      >
        {children}
      </select>
    </div>
  );
};

// Composant pour les cartes d'information
const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 mb-6 transition-all duration-200 hover:shadow-lg ${className}`}>
      <h2 className="text-lg font-semibold mb-5 text-gray-800 dark:text-white flex items-center pb-3 border-b border-gray-100 dark:border-gray-700">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      <div className="mt-4">
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
    <div className="mb-3">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </p>
      <p className="font-medium text-gray-900 dark:text-white">
        {value || '-'}
      </p>
    </div>
  );
};

// Fonction utilitaire pour calculer le nombre de jours entre deux dates
const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Réinitialiser les heures pour éviter les problèmes de calcul
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let count = 0;
  let current = new Date(start);

  // Parcourir chaque jour dans la plage
  while (current <= end) {
    // 0 = Dimanche, 6 = Samedi
    const dayOfWeek = current.getDay();
    // Ne compter que les jours de la semaine (lundi au vendredi)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }

    // Passer au jour suivant
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// Liste des types de congés payés
const CONGES_PAYES = ['Congé payé', 'Congé annuel', 'RTT', 'Congé maternité', 'Congé paternité'];

// Liste des types de congés sans solde
const CONGES_SANS_SOLDE = ['Congé sans solde', 'Absence non justifiée', 'Congé sabbatique'];

// Composant pour la section Dashboard des absences - AMÉLIORÉ
const AbsencesDashboard: React.FC<{
  absences: Absence[];
}> = ({ absences }) => {
  // Calculer l'année en cours
  const currentYear = new Date().getFullYear();

  // Obtenir les années uniques des absences
  const getUniqueYears = () => {
    const years = absences.map(absence => new Date(absence.dateDebut).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a); // Trier par ordre décroissant
  };

  const uniqueYears = getUniqueYears();

  // Fonction pour formater une date au format français
  const formatDateFr = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Obtenir le nom du mois en français
  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { month: 'long' });
  };

  // Déterminer si un motif est un congé payé
  const isCongePayé = (motif: string): boolean => {
    return CONGES_PAYES.some(conge => motif.toLowerCase().includes(conge.toLowerCase()));
  };

  // Déterminer si un motif est un congé sans solde
  const isCongeSansSolde = (motif: string): boolean => {
    return CONGES_SANS_SOLDE.some(conge => motif.toLowerCase().includes(conge.toLowerCase()));
  };

  // Calculer les statistiques des absences
  const calculateAbsenceStats = () => {
    // Initialiser les statistiques
    const stats = {
      absencesByMotif: {} as Record<string, number>,
      absencesByYear: {} as Record<number, {
        days: number,
        motifs: Record<string, number>,
        absences: Array<{
          dateDebut: string,
          dateFin: string,
          mois: string,
          motif: string,
          jours: number
        }>
      }>,
      totalCongesPayes: 0,
      totalCongesSansSolde: 0,
      totalAutresAbsences: 0
    };

    // Initialiser les absences par année pour toutes les années disponibles
    uniqueYears.forEach(year => {
      stats.absencesByYear[year] = {
        days: 0,
        motifs: {},
        absences: []
      };
    });

    // Analyser chaque absence
    absences.forEach(absence => {
      const startDate = new Date(absence.dateDebut);
      const endDate = new Date(absence.dateFin);
      const year = startDate.getFullYear();
      const month = getMonthName(startDate);

      // Calculer la durée de l'absence en jours ouvrables uniquement
      const daysCount = calculateDaysBetween(absence.dateDebut, absence.dateFin);

      // Compter par année
      if (!stats.absencesByYear[year]) {
        stats.absencesByYear[year] = {
          days: 0,
          motifs: {},
          absences: []
        };
      }

      stats.absencesByYear[year].days += daysCount;

      // Ajouter les détails de l'absence
      stats.absencesByYear[year].absences.push({
        dateDebut: formatDateFr(absence.dateDebut),
        dateFin: formatDateFr(absence.dateFin),
        mois: month,
        motif: absence.motif,
        jours: daysCount
      });

      // Compter par motif dans l'année
      if (!stats.absencesByYear[year].motifs[absence.motif]) {
        stats.absencesByYear[year].motifs[absence.motif] = 0;
      }
      stats.absencesByYear[year].motifs[absence.motif] += daysCount;

      // Compter tous les motifs
      if (!stats.absencesByMotif[absence.motif]) {
        stats.absencesByMotif[absence.motif] = 0;
      }
      stats.absencesByMotif[absence.motif] += daysCount;

      // Calculer les totaux par type de congé
      if (isCongePayé(absence.motif)) {
        stats.totalCongesPayes += daysCount;
      } else if (isCongeSansSolde(absence.motif)) {
        stats.totalCongesSansSolde += daysCount;
      } else {
        stats.totalAutresAbsences += daysCount;
      }
    });

    return stats;
  };

  const stats = calculateAbsenceStats();

  // Obtenir les données d'absence par année pour l'affichage
  const yearEntries = Object.entries(stats.absencesByYear);
  yearEntries.sort((a, b) => Number(b[0]) - Number(a[0])); // Trier par année décroissante

  // Récupérer les types de motifs uniques pour les utiliser dans le graphique
  const uniqueMotifs = Object.keys(stats.absencesByMotif);

  // Obtenir les couleurs pour les motifs
  const getMotifColor = (motif: string, index: number) => {
    const colors = [
      { bg: 'bg-blue-100', text: 'text-blue-800', bgDark: 'dark:bg-blue-900', textDark: 'dark:text-blue-200', border: 'border-blue-200', progress: 'bg-blue-500' },
      { bg: 'bg-green-100', text: 'text-green-800', bgDark: 'dark:bg-green-900', textDark: 'dark:text-green-200', border: 'border-green-200', progress: 'bg-green-500' },
      { bg: 'bg-purple-100', text: 'text-purple-800', bgDark: 'dark:bg-purple-900', textDark: 'dark:text-purple-200', border: 'border-purple-200', progress: 'bg-purple-500' },
      { bg: 'bg-yellow-100', text: 'text-yellow-800', bgDark: 'dark:bg-yellow-900', textDark: 'dark:text-yellow-200', border: 'border-yellow-200', progress: 'bg-yellow-500' },
      { bg: 'bg-red-100', text: 'text-red-800', bgDark: 'dark:bg-red-900', textDark: 'dark:text-red-200', border: 'border-red-200', progress: 'bg-red-500' },
      { bg: 'bg-indigo-100', text: 'text-indigo-800', bgDark: 'dark:bg-indigo-900', textDark: 'dark:text-indigo-200', border: 'border-indigo-200', progress: 'bg-indigo-500' }
    ];

    if (isCongePayé(motif)) {
      return colors[0]; // Bleu pour congés payés
    } else if (isCongeSansSolde(motif)) {
      return colors[4]; // Rouge pour congés sans solde
    } else {
      return colors[index % colors.length]; // Rotation des autres couleurs
    }
  };

  // Calcul du total des jours d'absence
  const totalDays = Object.values(stats.absencesByMotif).reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6">
      {/* Card pour les statistiques générales - AMÉLIORÉ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total jours d{"'"}absence</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalDays} jours
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Congés payés</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalCongesPayes} jours
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Congés sans solde</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.totalCongesSansSolde} jours
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Années couvertes</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {uniqueYears.length} années
          </p>
        </div>
      </div>


      {/* Absences par année - format de tableau détaillé - AMÉLIORÉ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md mb-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Absences par année
        </h3>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-700">
              <TableRow className="dark:border-gray-600">
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                  Année
                </TableHead>
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">
                  Période
                </TableHead>
                <TableHead className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                  Motif
                </TableHead>
                <TableHead className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                  Jours
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearEntries.length > 0 ? (
                yearEntries.flatMap(([year, yearData]) => (
                  yearData.absences.length > 0 ? (
                    yearData.absences.map((absence, absenceIndex) => {
                      // Déterminer le type de congé pour la coloration
                      let typeClass = '';
                      if (isCongePayé(absence.motif)) {
                        typeClass = 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
                      } else if (isCongeSansSolde(absence.motif)) {
                        typeClass = 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300';
                      } else {
                        typeClass = 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
                      }

                      return (
                        <TableRow
                          key={`${year}-${absenceIndex}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                        >
                          <TableCell className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {absenceIndex === 0 ? (
                              <div className="flex items-center">
                                <span className="text-lg font-bold">{year}</span>
                                {Number(year) === currentYear && (
                                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    Actuel
                                  </span>
                                )}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                              <span>{absence.dateDebut} - {absence.dateFin}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              isCongePayé(absence.motif)
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : isCongeSansSolde(absence.motif)
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}>
                              {absence.motif}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-2 whitespace-nowrap text-right">
                            <span className={`px-2 py-1 rounded-md ${typeClass} font-medium`}>
                              {absence.jours} jour{absence.jours > 1 ? 's' : ''}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow key={year} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                      <TableCell className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <span className="text-lg font-bold">{year}</span>
                          {Number(year) === currentYear && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Actuel
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell colSpan={3} className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                          Aucune absence pour cette année
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Calendar className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">Aucune donnée disponible</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Ajouter un récapitulatif en bas - AMÉLIORÉ */}
              {yearEntries.length > 0 && (
                <>
                  <TableRow className="bg-gray-50 dark:bg-gray-700 font-medium">
                    <TableCell colSpan={3} className="px-3 py-2 text-right text-gray-900 dark:text-white">
                      Total congés payés:
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 font-bold">
                      {stats.totalCongesPayes} jours
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-gray-50 dark:bg-gray-700 font-medium">
                    <TableCell colSpan={3} className="px-3 py-2 text-right text-gray-900 dark:text-white">
                      Total congés sans solde:
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-bold">
                      {stats.totalCongesSansSolde} jours
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-gray-50 dark:bg-gray-700 font-medium">
                    <TableCell colSpan={3} className="px-3 py-2 text-right text-gray-900 dark:text-white">
                      Total des jours d{"'"}absence:
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 font-bold">
                      {totalDays} jours
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
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

  // États pour les absences
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [absencesLoading, setAbsencesLoading] = useState(true);

  //contrats
  const [contratActif, setContratActif] = useState<Contrat | null>(null);
  const [contratLoading, setContratLoading] = useState(true);
  // États pour la gestion des documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState<'documents' | 'absences'>('documents');

  // Charger les données du collaborateur, ses documents et ses absences au chargement de la page
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setAbsencesLoading(true);
        setContratLoading(true);  // Ajouté

        // Charger les données du collaborateur
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
          setCurrentPhotoUrl(`http://3.67.202.103:8080/api/collaborateurs/${data.id}/photo`);
        }

        // Récupérer les documents du collaborateur
        const documentsData = await documentService.getDocumentsByCollaborateur(collaborateurId);
        setDocuments(documentsData);
        setFilteredDocuments(documentsData);

        // Récupérer les absences du collaborateur
        const absencesData = await absenceService.getByCollaborateur(collaborateurId);
        setAbsences(absencesData);

        // Nouveau bloc pour récupérer les contrats
        try {
          const contratsData = await contratService.getByCollaborateurId(collaborateurId);
          // Filtrer pour ne garder que le contrat actif (si présent)
          const contratActif = contratsData.find((contrat: any) =>
            !contrat.dateFin || new Date(contrat.dateFin) > new Date()
          );
          setContratActif(contratActif || null);
        } catch (error) {
          console.error('Erreur lors du chargement des contrats:', error);
          // Ne pas afficher d'erreur globale, juste pour les contrats
        }

        setErrorMessage(null);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrorMessage('Impossible de charger les informations du collaborateur ou ses documents. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
        setAbsencesLoading(false);
        setContratLoading(false);  // Ajouté
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
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/protected/collaborateurs')}
            className="mr-4 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Détails du Collaborateur</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 flex justify-center items-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-700 dark:text-gray-300">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Fil d'Ariane */}

      <div className="flex items-center mb-6">
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">

          <Button
            variant="outline"
            onClick={() => router.push('/protected/collaborateurs')}
            className="mr-4 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          <h1 className="text-1xl font-bold text-gray-800 dark:text-white">
            Dossier Collaborateur
            {collaborateur && ` : ${collaborateur.prenom} ${collaborateur.nom}`}
          </h1>
        </nav>
      </div>
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm animate-fadeIn">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md shadow-sm animate-fadeIn">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Informations du collaborateur */}
      {collaborateur && (
        <>
          {/* En-tête de profil avec photo et informations de base */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 mb-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Photo de profil à gauche */}
              <div className="flex-shrink-0 flex justify-center">
                <div className="relative w-40 h-40">
                  {currentPhotoUrl ? (
                    <Image
                      src={currentPhotoUrl}
                      alt={`${collaborateur.prenom} ${collaborateur.nom}`}
                      width={160} // 40 * 4 = 160px (based on w-40)
                      height={160} // 40 * 4 = 160px (based on h-40)
                      className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // Note: Next/Image handles errors differently
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-profile.png'; // Image de secours
                      }}
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-md">
                      <User size={60} className="text-blue-500 dark:text-blue-400" />
                    </div>
                  )}

                  {/* Badge de statut */}
                  <div className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-medium shadow-md ${
                    collaborateur.status === 'Actif'
                      ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100 border border-green-200 dark:border-green-600'
                      : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 border border-red-200 dark:border-red-600'
                  }`}>
                    {collaborateur.status}
                  </div>
                </div>
              </div>

              {/* Informations personnelles essentielles à droite */}
              <div className="flex-grow md:mt-0 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  {collaborateur.matricule && (
                    <span className="text-sm px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100 rounded-full flex items-center w-fit shadow-sm border border-blue-100 dark:border-blue-800">
                      <Hash className="w-3 h-3 mr-1" /> {collaborateur.matricule}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-4">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium">{collaborateur.titrePosteOccupe || 'Poste non spécifié'}</span>
                  </div>

                  <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <Phone className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                    <span>{collaborateur.telephone || 'Téléphone non spécifié'}</span>
                  </div>

                  <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <Mail className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                    <span>{collaborateur.email || 'Email non spécifié'}</span>
                  </div>

                  <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                    <span>{formatDate(collaborateur.dateNaissance) || 'Date de naissance non spécifiée'}</span>
                  </div>

                  <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                    <span>{collaborateur.cin || 'CIN non spécifié'}</span>
                  </div>

                  <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <User className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                    <span>{collaborateur.sexe || 'Sexe non spécifié'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {absencesLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-700 dark:text-gray-300">Chargement des absences...</p>
              </div>
            ) : absences.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium mb-2">Aucune absence enregistrée</p>
                <p className="text-sm">Ce collaborateur n{"'"}a pas encore d{"'"}absences dans le système.</p>
              </div>
            ) : (
              <>
                {/* Dashboard des statistiques d'absences */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center mb-6">
                    <BarChart2 className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
                    Dashboard des Absences
                  </h2>
                  <AbsencesDashboard absences={absences} />
                </div>
              </>
            )}
          </div>
          {/* Coordonnées */}
          <InfoCard
            title="Coordonnées"
            icon={<Mail className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoField label="Email" value={collaborateur.email} />
              <InfoField label="Numéro de Téléphone" value={collaborateur.telephone} />
              <InfoField label="Élection de Domicile" value={collaborateur.electionDomicile} />
            </div>
          </InfoCard>

          {/* Situation Familiale */}
          <InfoCard
            title="Situation Familiale"
            icon={<User className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoField label="Situation Familiale" value={collaborateur.situationFamiliale} />
              <InfoField label="Nombre de Personnes à Charge (Enfants)" value={collaborateur.nombrePersonnesACharge || '0'} />
              <InfoField label="CNSS" value={collaborateur.cnss} />
            </div>
          </InfoCard>

          {/* Détails Professionnels */}
          <InfoCard
            title="Détails Professionnels"
            icon={<Briefcase className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoField label="Nombre d'Années d'Expérience" value={collaborateur.nombreAnneeExperience} />
              <InfoField label="Niveau de Qualification ou Diplôme Obtenu" value={collaborateur.niveauQualification} />
              <InfoField label="Titre du Poste Occupé" value={collaborateur.titrePosteOccupe} />
              <InfoField label="RIB" value={collaborateur.rib} />
            </div>

            {collaborateur.tachesAccomplies && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Description</p>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner">
                  {collaborateur.tachesAccomplies}
                </div>
              </div>
            )}
          </InfoCard>
        </>
      )}
      {/* Informations du contrat actif - Ajoutez ce bloc */}
      {contratActif ? (
        <InfoCard
          title="Informations du contrat actif"
          icon={<Briefcase className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
          className="border-l-4 border-green-500 dark:border-green-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField
              label="Type de contrat"
              value={contratActif.typeContrat}
              icon={<File className="w-4 h-4 text-gray-500" />}
            />
            <InfoField
              label="Date d'embauche"
              value={formatDate(contratActif.dateEmbauche)}
              icon={<Calendar className="w-4 h-4 text-gray-500" />}
            />
            <InfoField
              label="Date de début"
              value={formatDate(contratActif.dateDebut)}
              icon={<Calendar className="w-4 h-4 text-gray-500" />}
            />
            {contratActif.dateFin && (
              <InfoField
                label="Date de fin"
                value={formatDate(contratActif.dateFin)}
                icon={<Calendar className="w-4 h-4 text-gray-500" />}
              />
            )}
            <InfoField
              label="Numéro de contrat"
              value={contratActif.numeroContrat}
              icon={<Hash className="w-4 h-4 text-gray-500" />}
            />
          </div>
        </InfoCard>
      ) : contratLoading ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 flex justify-center items-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-700 dark:text-gray-300">Chargement des données du contrat...</p>
        </div>
      ) : (
        <InfoCard
          title="Informations du contrat"
          icon={<Briefcase className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
          className="border-l-4 border-yellow-500 dark:border-yellow-600"
        >
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
            <File className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-center">Aucun contrat actif trouvé pour ce collaborateur.</p>
          </div>
        </InfoCard>
      )}

      {/* Section de téléchargement de documents */}
      <InfoCard
        title="Ajouter une pièce justificative"
        icon={<Upload className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
        className="border-l-4 border-blue-500 dark:border-blue-600"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-white mr-4 flex items-center h-10 flex-grow transition-colors duration-200"
              >
                <Upload className="w-4 h-4 mr-2 text-blue-500" />
                <span className="truncate flex-grow">
                  {selectedFile ? selectedFile.name : "Parcourir..."}
                </span>
              </label>

              <Button
                type="submit"
                disabled={uploadingFile || !selectedFile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg transition-colors duration-200"
              >
                {uploadingFile ? "Téléchargement..." : "Télécharger"}
              </Button>
            </div>
          </div>
        </form>
      </InfoCard>

      {/* Liste des documents avec barre de recherche */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
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
              className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none
                         focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
          <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">
              {documents.length === 0
                ? "Aucun document disponible"
                : "Aucun résultat trouvé"}
            </p>
            <p className="text-sm">
              {documents.length === 0
                ? "Vous pouvez ajouter des documents pour ce collaborateur en utilisant le formulaire ci-dessus."
                : "Essayez de modifier votre recherche pour trouver ce que vous cherchez."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                        <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3" />
                        <span className="text-gray-900 dark:text-white font-medium">{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {document.type}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {document.date}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {document.size}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        {/* View button */}
                        <button
                          className="h-8 w-8 rounded-full flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 transition-colors duration-200"
                          title="Visualiser"
                          onClick={() => handleViewDocument(document.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Download button */}
                        <button
                          className="h-8 w-8 rounded-full flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30 transition-colors duration-200"
                          title="Télécharger"
                          onClick={() => handleDownloadDocument(document.id)}
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          className="h-8 w-8 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 transition-colors duration-200"
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
          </div>
        )}
      </div>

      {/* Bouton de retour avec style amélioré */}
      <div className="flex justify-end space-x-4 mb-8">
        <Button
          onClick={() => router.push('/protected/collaborateurs')}
          className="px-6 py-3 flex items-center gap-2 bg-gradient-to-r from-gray-200 to-gray-100 hover:from-gray-300 hover:to-gray-200
                     text-gray-800 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700
                     dark:text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Button>
      </div>
    </div>
  );
}