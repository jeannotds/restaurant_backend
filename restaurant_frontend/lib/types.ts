export interface Restaurant {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
}

export interface RestaurantStats {
  tables_total: number;
  tables_occupees: number;
  places_total: number;
  places_occupees: number;
  places_libres: number;
  commandes_actives: number;
  produits_total: number;
  produits_disponibles: number;
  places_reservées: number;
  produits_non_disponibles: number;
}

export interface Table {
  id: string;
  numero: number;
  capacity: number;
  places_occupees?: number;
  status: string;
  code_acces: string | null;
  restaurant_id: string;
}

export interface TableJoinRequest {
  code_acces: string;
  nombre_de_places: number;
}

export interface TableJoinResponse {
  occupation_id: string;
  table_id: string;
  table_numero: number;
  nombre_de_places: number;
  places_occupees: number;
  places_libres: number;
  status: string;
}

export interface TableEndOccupationResponse {
  message: string;
  occupation_id: string;
  places_occupees: number;
  places_libres: number;
  status: string;
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
  public_id?: string | null;
}

export type ImageReplacement = {
  imageId: string;
  publicId: string;
  file: File;
};

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
  occupation_id?: string | null;
}

export type TableStatus = "LIBRE" | "PARTIELLE" | "OCCUPEE" | "RESERVEE";
export type CommandeStatut =
  | "EN_ATTENTE"
  | "EN_PREPARATION"
  | "PRETE"
  | "SERVIE"
  | "PAYEE"
  | "ANNULEE";

export interface AuthUserCreate {
  nom: string;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  password: string;
  restaurant_id?: string | null;
}

export interface AuthUserResponse {
  id: string;
  nom: string;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  restaurant_id?: string | null;
  is_active: boolean;
}
