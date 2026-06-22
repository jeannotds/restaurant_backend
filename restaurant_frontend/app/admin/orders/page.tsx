"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCommandeNumber, formatPrice } from "@/lib/format";
import type { Commande } from "@/lib/types";
import { PageHeader } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { TableContainer } from "@/components/ui/TableContainer";

const STATUTS = [
  "TOUS",
  "EN_ATTENTE",
  "EN_PREPARATION",
  "PRETE",
  "SERVIE",
  "PAYEE",
  "ANNULEE",
];

export default function OrdersPage() {
  const [items, setItems] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TOUS");

  useEffect(() => {
    api
      .get<Commande[]>("/commandes/")
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "TOUS" ? items : items.filter((c) => c.statut === filter);

  return (
    <div>
      <PageHeader
        title="Commandes"
        description="Suivez et gérez toutes les commandes"
        action={
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={STATUTS.map((s) => ({
              value: s,
              label: s === "TOUS" ? "Tous les statuts" : s.replace(/_/g, " "),
            }))}
            className="min-w-48"
          />
        }
      />

      {loading ? (
        <p className="text-muted">Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">Aucune commande trouvée.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((cmd) => (
              <Link
                key={cmd.id}
                href={`/admin/orders/${cmd.id}`}
                className="block rounded-xl border border-border bg-surface p-4 transition hover:bg-background"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-secondary">
                      {formatCommandeNumber(cmd.numero_commande)}
                    </p>
                    <p className="text-sm text-muted">
                      {cmd.items.length} article(s)
                    </p>
                  </div>
                  <Badge tone={statusTone(cmd.statut)}>{cmd.statut}</Badge>
                </div>
                <p className="mt-2 font-semibold text-primary">
                  {formatPrice(cmd.montant_total)}
                </p>
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <TableContainer minWidth="680px">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-4 py-3 font-medium">N°</th>
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
            </TableContainer>
          </div>
        </>
      )}
    </div>
  );
}
