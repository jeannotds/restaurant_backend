"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { CartItem } from "@/components/client/MenuView";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { ApiError, api } from "@/lib/api";
import type { Commande } from "@/lib/types";
import { useState } from "react";

interface CartPanelProps {
  restaurantId: string;
  tableId: string;
  tableNumero: number;
  cart: CartItem[];
  onAdd: (produitId: string) => void;
  onRemove: (produitId: string) => void;
  onClear: () => void;
  existingOrders: Commande[];
}

export function CartPanel({
  restaurantId,
  tableId,
  tableNumero,
  cart,
  onAdd,
  onRemove,
  onClear,
  existingOrders,
}: CartPanelProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + item.produit.price * item.quantite,
    0,
  );

  const tableOrders = existingOrders.filter((o) => o.table_id === tableId);

  async function handleSubmit() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const allOrders = await api.get<Commande[]>(
        `/commandes/?restaurant_id=${restaurantId}`,
      );
      const nextNum =
        allOrders.reduce((max, o) => Math.max(max, o.numero_commande), 0) + 1;

      const commande = await api.post<Commande>("/commandes/", {
        table_id: tableId,
        numero_commande: nextNum,
        statut: "EN_ATTENTE",
        montant_total: total,
        items: cart.map((item) => ({
          produit_id: item.produit.id,
          quantite: item.quantite,
        })),
      });

      onClear();
      router.push(`/restaurants/${restaurantId}/commande/${commande.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la commande");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-muted">Vous commandez pour</p>
        <p className="text-lg font-bold text-secondary">Table {tableNumero}</p>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <ShoppingCart size={32} className="mx-auto text-muted" />
          <p className="mt-3 text-muted">Votre panier est vide.</p>
          <p className="mt-1 text-sm text-muted">
            Ajoutez des articles depuis l&apos;onglet Menu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.produit.id}
              className="rounded-xl border border-border bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-secondary">{item.produit.nom}</p>
                  <p className="text-sm text-muted">
                    {formatPrice(item.produit.price)} × {item.quantite}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-secondary">
                  {formatPrice(item.produit.price * item.quantite)}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRemove(item.produit.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">
                    {item.quantite}
                  </span>
                  <button
                    onClick={() => onAdd(item.produit.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl bg-background p-4">
            <span className="font-medium text-secondary">Total</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(total)}
            </span>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" onClick={onClear} className="sm:flex-1">
              <Trash2 size={16} /> Vider
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="sm:flex-[2]"
            >
              {submitting ? "Envoi..." : "Commander"}
            </Button>
          </div>
        </div>
      )}

      {tableOrders.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-secondary">
            Vos commandes sur cette table
          </h3>
          <div className="space-y-2">
            {tableOrders.map((order) => (
              <button
                key={order.id}
                onClick={() =>
                  router.push(
                    `/restaurants/${restaurantId}/commande/${order.id}`,
                  )
                }
                className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left transition hover:border-primary/40"
              >
                <div>
                  <p className="font-medium text-secondary">
                    Commande #{String(order.numero_commande).padStart(4, "0")}
                  </p>
                  <p className="text-sm text-muted">
                    {order.items.length} article(s) · {order.statut.replace(/_/g, " ")}
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {formatPrice(order.montant_total)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
