"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Store } from "lucide-react";
import { api } from "@/lib/api";
import type { Restaurant } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/Card";

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get<Restaurant>(`/restaurants/${id}`)
      .then(setRestaurant)
      .catch(() => setError("Restaurant introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-muted">Chargement...</p>;
  }

  if (error || !restaurant) {
    return (
      <div>
        <Link
          href="/admin/restaurants"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} /> Retour aux restaurants
        </Link>
        <p className="text-danger">{error || "Restaurant introuvable."}</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/restaurants"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} /> Retour aux restaurants
      </Link>

      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">{restaurant.nom}</h1>
          <p className="mt-1 text-sm text-muted">
            Fiche établissement — informations générales
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <MapPin size={20} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-sm font-medium text-muted">Adresse</p>
              <p className="mt-1 text-secondary">{restaurant.adresse}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <Phone size={20} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-sm font-medium text-muted">Téléphone</p>
              <p className="mt-1 text-secondary">{restaurant.telephone}</p>
            </div>
          </div>
        </Card>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-secondary">Vue d&apos;ensemble</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tables" value="—" hint="Bientôt disponible" />
        <StatCard label="Places occupées" value="—" hint="Bientôt disponible" />
        <StatCard label="Commandes actives" value="—" hint="Bientôt disponible" />
        <StatCard label="Produits" value="—" hint="Bientôt disponible" />
      </div>
    </div>
  );
}
