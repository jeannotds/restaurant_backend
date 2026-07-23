"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { Category, Produit } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface CartItem {
  produit: Produit;
  quantite: number;
}

interface MenuViewProps {
  categories: Category[];
  produits: Produit[];
  cart: CartItem[];
  onAdd: (produit: Produit) => void;
  onRemove: (produitId: string) => void;
  canOrder: boolean;
  orderBlockedMessage?: string;
}

export function MenuView({
  categories,
  produits,
  cart,
  onAdd,
  onRemove,
  canOrder,
  orderBlockedMessage = "Connectez-vous à une table pour commander",
}: MenuViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const disponibles = produits.filter((p) => p.disponible);
  const filtered =
    activeCategory === "all"
      ? disponibles
      : disponibles.filter((p) => p.categorie_id === activeCategory);

  function cartQty(produitId: string) {
    return cart.find((c) => c.produit.id === produitId)?.quantite ?? 0;
  }

  if (disponibles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <ShoppingBag size={32} className="mx-auto text-muted" />
        <p className="mt-3 text-muted">Aucun produit disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div>
      {categories.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
              activeCategory === "all"
                ? "bg-primary text-white"
                : "bg-border/50 text-muted hover:text-foreground",
            )}
          >
            Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
                activeCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-border/50 text-muted hover:text-foreground",
              )}
            >
              {cat.nom}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((produit) => {
          const qty = cartQty(produit.id);
          const category = categories.find((c) => c.id === produit.categorie_id);
          const imageUrl = produit.images[0]?.url_image;

          return (
            <div
              key={produit.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={produit.nom}
                  className="h-36 w-full shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
                />
              ) : (
                <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-lg bg-background text-2xl sm:h-20 sm:w-20">
                  🍽️
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-secondary">{produit.nom}</h3>
                    {category && (
                      <p className="text-xs text-muted">{category.nom}</p>
                    )}
                  </div>
                  <p className="shrink-0 font-semibold text-primary">
                    {formatPrice(produit.price)}
                  </p>
                </div>
                {produit.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {produit.description}
                  </p>
                )}
                {canOrder ? (
                  <div className="mt-2 flex items-center gap-2">
                    {qty > 0 ? (
                      <>
                        <button
                          onClick={() => onRemove(produit.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition hover:bg-background"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {qty}
                        </span>
                        <button
                          onClick={() => onAdd(produit)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-hover"
                        >
                          <Plus size={14} />
                        </button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => onAdd(produit)}>
                        <Plus size={14} /> Ajouter
                      </Button>
                    )}
                  </div>
                ) : (
                  <Badge tone="secondary" className="mt-2">
                    {orderBlockedMessage}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
