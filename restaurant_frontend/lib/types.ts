export interface Restaurant {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
}

export interface Table {
  id: string;
  numero: number;
  capacity: number;
  status: string;
  code_acces: string | null;
  restaurant_id: string;
}

export interface Category {
  id: string;
  nom: string;
  description: string | null;
  restaurant_id: string;
}

export interface ProduitImage {
  id: string;
  produit_id: string;
  url_image: string;
}

export interface Produit {
  id: string;
  nom: string;
  description: string | null;
  price: number;
  disponible: boolean;
  categorie_id: string;
  restaurant_id: string;
  images: ProduitImage[];
}

export interface CommandeItem {
  id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface Commande {
  id: string;
  table_id: string;
  numero_commande: number;
  statut: string;
  montant_total: number;
  items: CommandeItem[];
}

export type TableStatus = "LIBRE" | "OCCUPEE" | "RESERVEE";
export type CommandeStatut =
  | "EN_ATTENTE"
  | "EN_PREPARATION"
  | "PRETE"
  | "SERVIE"
  | "PAYEE"
  | "ANNULEE";
