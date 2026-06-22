"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { Commande, Produit, Restaurant, Table } from "@/lib/types";
import { formatCommandeNumber, formatPrice } from "@/lib/format";
import { labelCommandeStatus } from "@/lib/labels";
import { ClientHeader } from "@/components/client/ClientHeader";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function OrderTrackingPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const orderId = params.orderId as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [order, setOrder] = useState<Commande | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      api.get<Restaurant>(`/restaurants/${restaurantId}`),
      api.get<Commande>(`/commandes/${orderId}`),
      api.get<Produit[]>(`/produits/?restaurant_id=${restaurantId}`),
    ])
      .then(async ([r, o, p]) => {
        setRestaurant(r);
        setOrder(o);
        setProduits(p);
        const t = await api.get<Table>(`/tables/${o.table_id}`);
        setTable(t);
      })
      .catch(() => setError("Commande introuvable."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      api
        .get<Commande>(`/commandes/${orderId}`)
        .then(setOrder)
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [orderId, restaurantId]);

  function produitName(produitId: string) {
    return produits.find((p) => p.id === produitId)?.nom ?? "Article";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ClientHeader title="Suivi commande" backHref={`/restaurants/${restaurantId}`} />
        <p className="p-6 text-center text-muted">Chargement...</p>
      </div>
    );
  }

  if (error || !order || !restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <ClientHeader title="Erreur" backHref={`/restaurants/${restaurantId}`} />
        <p className="p-6 text-center text-danger">
          {error || "Commande introuvable."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader
        title={restaurant.nom}
        subtitle="Suivi de votre commande"
        backHref={`/restaurants/${restaurantId}`}
      />

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Numéro de commande</p>
              <p className="text-2xl font-bold text-secondary">
                {formatCommandeNumber(order.numero_commande)}
              </p>
              {table && (
                <p className="mt-1 text-sm text-muted">
                  Table {table.numero}
                </p>
              )}
            </div>
            <Badge tone={statusTone(order.statut)} className="text-sm">
              {labelCommandeStatus(order.statut)}
            </Badge>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-secondary">Articles</h2>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {produitName(item.produit_id)} × {item.quantite}
                </span>
                <span className="font-medium">
                  {formatPrice(item.sous_total)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold text-secondary">Total</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(order.montant_total)}
            </span>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button variant="ghost" onClick={load}>
            <RefreshCw size={16} /> Actualiser le statut
          </Button>
        </div>
      </main>
    </div>
  );
}
