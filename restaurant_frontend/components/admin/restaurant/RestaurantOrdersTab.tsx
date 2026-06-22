"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCommandeNumber, formatPrice } from "@/lib/format";
import type { Commande, Table } from "@/lib/types";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";

const STATUTS = [
  "TOUS",
  "EN_ATTENTE",
  "EN_PREPARATION",
  "PRETE",
  "SERVIE",
  "PAYEE",
  "ANNULEE",
];

export function RestaurantOrdersTab({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<Commande[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TOUS");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<Commande[]>(`/commandes/?restaurant_id=${restaurantId}`),
      api.get<Table[]>(`/tables/?restaurant_id=${restaurantId}`),
    ])
      .then(([commandes, tablesData]) => {
        setItems(commandes);
        setTables(tablesData);
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  function tableLabel(tableId: string) {
    const table = tables.find((t) => t.id === tableId);
    return table ? `Table ${table.numero}` : tableId.slice(0, 8);
  }

  const filtered =
    filter === "TOUS" ? items : items.filter((c) => c.statut === filter);

  if (loading) {
    return <p className="text-muted">Chargement des commandes...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={STATUTS.map((s) => ({
            value: s,
            label: s === "TOUS" ? "Tous les statuts" : s.replace(/_/g, " "),
          }))}
          className="min-w-48"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">Aucune commande pour ce restaurant.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background">
              <tr>
                <th className="px-4 py-3 font-medium">N°</th>
                <th className="px-4 py-3 font-medium">Table</th>
                <th className="px-4 py-3 font-medium">Articles</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cmd) => (
                <tr key={cmd.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {formatCommandeNumber(cmd.numero_commande)}
                  </td>
                  <td className="px-4 py-3 text-muted">{tableLabel(cmd.table_id)}</td>
                  <td className="px-4 py-3 text-muted">
                    {cmd.items.length} article(s)
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(cmd.montant_total)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(cmd.statut)}>{cmd.statut}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${cmd.id}`}
                      className="text-primary hover:underline"
                    >
                      Voir détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
