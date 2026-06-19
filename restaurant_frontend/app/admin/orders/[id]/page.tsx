"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatCommandeNumber, formatPrice } from "@/lib/format";
import type { Commande, Produit } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";

const NEXT_STATUTS = [
  "EN_ATTENTE",
  "EN_PREPARATION",
  "PRETE",
  "SERVIE",
  "PAYEE",
  "ANNULEE",
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [commande, setCommande] = useState<Commande | null>(null);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    Promise.all([
      api.get<Commande>(`/commandes/${id}`),
      api.get<Produit[]>("/produits/"),
    ])
      .then(([cmd, prods]) => {
        setCommande(cmd);
        setStatut(cmd.statut);
        setProduits(prods);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function produitName(produitId: string) {
    return produits.find((p) => p.id === produitId)?.nom ?? produitId.slice(0, 8);
  }

  async function updateStatut() {
    if (!commande) return;
    setSaving(true);
    try {
      await api.put(`/commandes/${commande.id}`, { statut });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!commande || !confirm("Supprimer cette commande ?")) return;
    try {
      await api.delete(`/commandes/${commande.id}`);
      router.push("/admin/orders");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur");
    }
  }

  if (loading) return <p className="text-muted">Chargement...</p>;
  if (!commande) return <p className="text-danger">Commande introuvable.</p>;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} /> Retour aux commandes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            {formatCommandeNumber(commande.numero_commande)}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Table ID : {commande.table_id.slice(0, 8)}...
          </p>
        </div>
        <Badge tone={statusTone(commande.statut)} className="text-sm">
          {commande.statut}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold text-secondary">Articles</h2>
          <div className="space-y-3">
            {commande.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{produitName(item.produit_id)}</p>
                  <p className="text-sm text-muted">
                    {item.quantite} × {formatPrice(item.prix_unitaire)}
                  </p>
                </div>
                <p className="font-medium">{formatPrice(item.sous_total)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(commande.montant_total)}
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-secondary">Actions</h2>
          <div className="space-y-4">
            <Select
              label="Changer le statut"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              options={NEXT_STATUTS.map((s) => ({
                value: s,
                label: s.replace(/_/g, " "),
              }))}
            />
            <Button
              className="w-full"
              onClick={updateStatut}
              disabled={saving || statut === commande.statut}
            >
              {saving ? "Enregistrement..." : "Mettre à jour"}
            </Button>
            <Button variant="danger" className="w-full" onClick={handleDelete}>
              Supprimer la commande
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
