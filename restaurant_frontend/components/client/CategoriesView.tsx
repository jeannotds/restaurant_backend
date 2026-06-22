"use client";

import type { Category, Produit } from "@/lib/types";

interface CategoriesViewProps {
  categories: Category[];
  produits: Produit[];
}

export function CategoriesView({ categories, produits }: CategoriesViewProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-muted">Aucune catégorie pour ce restaurant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const catProduits = produits.filter((p) => p.categorie_id === cat.id);
        const disponibles = catProduits.filter((p) => p.disponible).length;

        return (
          <div
            key={cat.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-secondary">{cat.nom}</h3>
                {cat.description && (
                  <p className="mt-1 text-sm text-muted">{cat.description}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted">
                {disponibles}/{catProduits.length} dispo.
              </span>
            </div>
            {catProduits.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-border pt-3">
                {catProduits.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className={p.disponible ? "" : "text-muted line-through"}>
                      {p.nom}
                    </span>
                    <span className="text-muted">
                      {p.disponible ? "✓" : "Indisponible"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
