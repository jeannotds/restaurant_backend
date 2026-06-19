"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCommandeNumber, formatPrice } from "@/lib/format";
import type { Commande, Produit, Restaurant, Table } from "@/lib/types";
import { PageHeader, StatCard, Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Restaurant[]>("/restaurants/"),
      api.get<Table[]>("/tables/"),
      api.get<Produit[]>("/produits/"),
      api.get<Commande[]>("/commandes/"),
    ])
      .then(([r, t, p, c]) => {
        setRestaurants(r);
        setTables(t);
        setProduits(p);
        setCommandes(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const tablesOccupees = tables.filter((t) => t.status === "OCCUPEE").length;
  const caTotal = commandes.reduce((sum, c) => sum + c.montant_total, 0);
  const enPreparation = commandes.filter(
    (c) => c.statut === "EN_PREPARATION" || c.statut === "EN_ATTENTE",
  ).length;
  const recent = [...commandes]
    .sort((a, b) => b.numero_commande - a.numero_commande)
    .slice(0, 5);

  if (loading) {
    return <p className="text-muted">Chargement du dashboard...</p>;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          restaurants[0]
            ? `Restaurant actif : ${restaurants[0].nom}`
            : "Créez un restaurant pour commencer"
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Commandes" value={commandes.length} />
        <StatCard label="Chiffre d'affaires" value={formatPrice(caTotal)} />
        <StatCard
          label="Tables occupées"
          value={`${tablesOccupees} / ${tables.length}`}
        />
        <StatCard label="En préparation" value={enPreparation} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-secondary">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-sm text-primary">
              Voir tout
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Aucune commande pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((cmd) => (
                <Link
                  key={cmd.id}
                  href={`/admin/orders/${cmd.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:bg-background"
                >
                  <div>
                    <p className="font-medium">
                      {formatCommandeNumber(cmd.numero_commande)}
                    </p>
                    <p className="text-xs text-muted">
                      Table · {cmd.items.length} article(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge tone={statusTone(cmd.statut)}>{cmd.statut}</Badge>
                    <p className="mt-1 text-sm font-medium">
                      {formatPrice(cmd.montant_total)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-secondary">Produits</h2>
            <Link href="/admin/products" className="text-sm text-primary">
              Gérer
            </Link>
          </div>
          <p className="mb-3 text-sm text-muted">
            {produits.length} produit(s) ·{" "}
            {produits.filter((p) => p.disponible).length} disponible(s)
          </p>
          <div className="space-y-2">
            {produits.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{p.nom}</span>
                <span className="font-medium text-primary">
                  {formatPrice(p.price)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
