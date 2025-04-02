export interface Contrat {
  id?: number;
  collaborateurId: number;
  numeroContrat: string;
  poste: string;
  dateEmbauche: string;
  dateDebut: string;
  dateFin?: string;
  typeContrat: string;
  salaireBase: number;
  anciennete?: number;
  modeEnPaiement?: string;

  // Primes
  primeTransport?: number;
  primePanier?: number;
  primeRepresentation?: number;
  primeResponsabilite?: number;
  autresPrimes?: number;

  // Indemnités
  indemnitesKilometriques?: number;
  noteDeFrais?: number;
  avantages?: string;

  // Retenues
  ir?: number;
  cnss?: number;
  cimr?: number;
  mutuelle?: number;
  retraite?: number;

  status: 'Actif' | 'Expiré' | 'Résilié';
  documentUrl?: string;
}