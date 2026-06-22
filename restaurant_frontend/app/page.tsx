"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Restaurant } from "@/lib/types";
import { ClientHeader } from "@/components/client/ClientHeader";
import { RestaurantCard } from "@/components/client/RestaurantCard";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Restaurant[]>("/restaurants/")
      .then(setRestaurants)
      .catch(() => setError("Impossible de charger les restaurants."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader
        title="Restaurant QR"
        subtitle="Choisissez votre restaurant"
      />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-secondary">
            Où souhaitez-vous commander ?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Sélectionnez un restaurant pour voir le menu, les tables et passer
            commande.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted">Chargement...</p>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : restaurants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted">Aucun restaurant disponible.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
