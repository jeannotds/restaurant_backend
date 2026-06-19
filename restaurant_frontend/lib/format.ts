export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "CDF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCommandeNumber(num: number): string {
  return `#CMD-${String(num).padStart(4, "0")}`;
}
