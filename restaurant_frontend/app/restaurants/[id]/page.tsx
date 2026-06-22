"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { api } from "@/lib/api";
import type {
  Category,
  Commande,
  Produit,
  Restaurant,
  RestaurantStats,
  Table,
} from "@/lib/types";
import {
  getSessionForRestaurant,
  setClientSession,
  type ClientSession,
} from "@/lib/client-session";
import { ClientHeader } from "@/components/client/ClientHeader";
import {
  ClientTabBar,
  type ClientTab,
} from "@/components/client/ClientTabBar";
import { MenuView, type CartItem } from "@/components/client/MenuView";
import { TablesView } from "@/components/client/TablesView";
import { CategoriesView } from "@/components/client/CategoriesView";
import { CartPanel } from "@/components/client/CartPanel";
import { AccessCodeModal } from "@/components/client/AccessCodeModal";
import { StatCard } from "@/components/ui/Card";

export default function RestaurantClientPage() {
  const params = useParams();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [orders, setOrders] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ClientTab>("menu");
  const [session, setSession] = useState<ClientSession | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [accessCodeOpen, setAccessCodeOpen] = useState(false);

  const loadData = useCallback(() => {
    return Promise.all([
      api.get<Restaurant>(`/restaurants/${restaurantId}`),
      api.get<RestaurantStats>(`/restaurants/${restaurantId}/stats`),
      api.get<Table[]>(`/tables/?restaurant_id=${restaurantId}`),
      api.get<Category[]>(`/categories/?restaurant_id=${restaurantId}`),
      api.get<Produit[]>(`/produits/?restaurant_id=${restaurantId}`),
      api.get<Commande[]>(`/commandes/?restaurant_id=${restaurantId}`),
    ]);
  }, [restaurantId]);

  useEffect(() => {
    setLoading(true);
    setError("");
    loadData()
      .then(([r, s, t, c, p, o]) => {
        setRestaurant(r);
        setStats(s);
        setTables(t);
        setCategories(c);
        setProduits(p);
        setOrders(o);
      })
      .catch(() => setError("Restaurant introuvable."))
      .finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    setSession(getSessionForRestaurant(restaurantId));
  }, [restaurantId]);

  function connectTable(table: Table) {
    const newSession: ClientSession = {
      restaurantId,
      tableId: table.id,
      tableNumero: table.numero,
    };
    setClientSession(newSession);
    setSession(newSession);
    setActiveTab("menu");
  }

  function addToCart(produit: Produit) {
    setCart((prev) => {
      const existing = prev.find((c) => c.produit.id === produit.id);
      if (existing) {
        return prev.map((c) =>
          c.produit.id === produit.id
            ? { ...c, quantite: c.quantite + 1 }
            : c,
        );
      }
      return [...prev, { produit, quantite: 1 }];
    });
  }

  function removeFromCart(produitId: string) {
    setCart((prev) => {
      const existing = prev.find((c) => c.produit.id === produitId);
      if (!existing) return prev;
      if (existing.quantite <= 1) {
        return prev.filter((c) => c.produit.id !== produitId);
      }
      return prev.map((c) =>
        c.produit.id === produitId
          ? { ...c, quantite: c.quantite - 1 }
          : c,
      );
    });
  }

  function addById(produitId: string) {
    const produit = produits.find((p) => p.id === produitId);
    if (produit) addToCart(produit);
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantite, 0);
  const hasSession = !!session;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ClientHeader title="Chargement..." backHref="/" />
        <p className="p-6 text-center text-muted">Chargement...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <ClientHeader title="Erreur" backHref="/" />
        <p className="p-6 text-center text-danger">
          {error || "Restaurant introuvable."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-20">
      <ClientHeader
        title={restaurant.nom}
        subtitle={
          hasSession
            ? `Table ${session.tableNumero} · Connecté`
            : "Sélectionnez une table pour commander"
        }
        backHref="/"
      />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="mb-4 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-3">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {restaurant.adresse}
          </span>
          <span className="flex items-center gap-1">
            <Phone size={14} />
            {restaurant.telephone}
          </span>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Tables libres"
              value={stats.tables_total - stats.tables_occupees}
            />
            <StatCard label="Tables occupées" value={stats.tables_occupees} />
            <StatCard
              label="Produits"
              value={stats.produits_disponibles}
              hint={`sur ${stats.produits_total}`}
            />
            <StatCard
              label="Commandes actives"
              value={stats.commandes_actives}
            />
          </div>
        )}

        {!hasSession && activeTab !== "tables" && (
          <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            Connectez-vous à une table via l&apos;onglet{" "}
            <button
              onClick={() => setActiveTab("tables")}
              className="font-semibold underline"
            >
              Tables
            </button>{" "}
            ou entrez votre code d&apos;accès pour commander.
          </div>
        )}

        {activeTab === "menu" && (
          <MenuView
            categories={categories}
            produits={produits}
            cart={cart}
            onAdd={addToCart}
            onRemove={removeFromCart}
            canOrder={hasSession}
          />
        )}

        {activeTab === "tables" && (
          <TablesView
            tables={tables}
            selectedTableId={session?.tableId ?? null}
            onSelectTable={connectTable}
            onOpenAccessCode={() => setAccessCodeOpen(true)}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesView categories={categories} produits={produits} />
        )}

        {activeTab === "order" && (
          hasSession ? (
            <CartPanel
              restaurantId={restaurantId}
              tableId={session.tableId}
              tableNumero={session.tableNumero}
              cart={cart}
              onAdd={addById}
              onRemove={removeFromCart}
              onClear={() => setCart([])}
              existingOrders={orders}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-muted">
                Sélectionnez d&apos;abord une table pour passer commande.
              </p>
              <button
                onClick={() => setActiveTab("tables")}
                className="mt-3 text-sm font-medium text-primary underline"
              >
                Aller aux tables
              </button>
            </div>
          )
        )}
      </main>

      <ClientTabBar
        active={activeTab}
        onChange={setActiveTab}
        cartCount={cartCount}
      />

      <AccessCodeModal
        open={accessCodeOpen}
        tables={tables}
        onClose={() => setAccessCodeOpen(false)}
        onSuccess={connectTable}
      />
    </div>
  );
}
