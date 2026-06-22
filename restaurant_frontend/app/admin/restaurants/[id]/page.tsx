"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Store } from "lucide-react";
import { api } from "@/lib/api";
import type { Restaurant, RestaurantStats } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/Card";
import { RestaurantTablesTab } from "@/components/admin/restaurant/RestaurantTablesTab";
import { RestaurantOrdersTab } from "@/components/admin/restaurant/RestaurantOrdersTab";
import { RestaurantCategoriesTab } from "@/components/admin/restaurant/RestaurantCategoriesTab";
import { RestaurantProductsTab } from "@/components/admin/restaurant/RestaurantProductsTab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "tables", label: "Tables" },
  { id: "commandes", label: "Commandes" },
  { id: "categories", label: "Catégories" },
  { id: "produits", label: "Produits" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("tables");

  const loadStats = useCallback(() => {
    api.get<RestaurantStats>(`/restaurants/${id}/stats`).then(setStats).catch(() => {});
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get<Restaurant>(`/restaurants/${id}`),
      api.get<RestaurantStats>(`/restaurants/${id}/stats`),
    ])
      .then(([restaurantData, statsData]) => {
        setRestaurant(restaurantData);
        setStats(statsData);
      })
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

      {stats && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-secondary">
            Vue d&apos;ensemble
          </h2>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Tables"
              value={stats.tables_total}
              hint={`${stats.tables_occupees} occupée${stats.tables_occupees > 1 ? "s" : ""}`}
            />
            <StatCard
              label="Places occupées"
              value={`${stats.places_occupees}/${stats.places_total}`}
              hint={`${stats.places_libres} libre${stats.places_libres > 1 ? "s" : ""} · ${stats.places_reservées} réservée${stats.places_reservées > 1 ? "s" : ""}`}
            />
            <StatCard
              label="Commandes actives"
              value={stats.commandes_actives}
              hint="En attente, préparation, prêtes ou servies"
            />
            <StatCard
              label="Produits"
              value={stats.produits_total}
              hint={`${stats.produits_disponibles} disponible${stats.produits_disponibles > 1 ? "s" : ""} · ${stats.produits_non_disponibles} indisponible${stats.produits_non_disponibles > 1 ? "s" : ""}`}
            />
          </div>
        </>
      )}

      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "tables" && (
        <RestaurantTablesTab restaurantId={id} onDataChange={loadStats} />
      )}
      {activeTab === "commandes" && <RestaurantOrdersTab restaurantId={id} />}
      {activeTab === "categories" && (
        <RestaurantCategoriesTab restaurantId={id} onDataChange={loadStats} />
      )}
      {activeTab === "produits" && (
        <RestaurantProductsTab restaurantId={id} onDataChange={loadStats} />
      )}
    </div>
  );
}
