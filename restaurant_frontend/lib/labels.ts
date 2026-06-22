export const TABLE_STATUS_LABELS: Record<string, string> = {
  LIBRE: "Libre",
  OCCUPEE: "Occupée",
  RESERVEE: "Réservée",
};

export const COMMANDE_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  SERVIE: "Servie",
  PAYEE: "Payée",
  ANNULEE: "Annulée",
};

export function labelTableStatus(status: string): string {
  return TABLE_STATUS_LABELS[status] ?? status;
}

export function labelCommandeStatus(status: string): string {
  return COMMANDE_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}
