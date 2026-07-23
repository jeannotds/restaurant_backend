"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRightLeft, LogOut, MapPin, Phone, UserRound } from "lucide-react";
import { api, changeRestaurant, endOccupation } from "@/lib/api";
import type {
  AuthUserResponse,
  Category,
  Commande,
  Produit,
  Restaurant,
  RestaurantStats,
  Table,
  TableJoinResponse,
} from "@/lib/types";
import {
  clearClientSession,
  getSessionForRestaurant,
  setClientSession,
  type ClientSession,
} from "@/lib/client-session";
import {
  clearAuthUser,
  getAuthUser,
  getAuthUserForRestaurant,
  setAuthUser,
} from "@/lib/auth-session";
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
import { LeaveTableConfirmModal } from "@/components/client/LeaveTableConfirmModal";
import { SignupModal } from "@/components/client/SignupModal";
import { LoginModal } from "@/components/client/LoginModal";
import { ProfileModal } from "@/components/client/ProfileModal";
import { StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
  const [joinTargetTable, setJoinTargetTable] = useState<Table | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [joinBlockedMessage, setJoinBlockedMessage] = useState("");
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [authUser, setAuthUserState] = useState<AuthUserResponse | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<AuthUserResponse | null>(
    null,
  );
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switchingRestaurant, setSwitchingRestaurant] = useState(false);
  const [switchError, setSwitchError] = useState("");

  const canSwitchRestaurant =
    !!loggedInUser &&
    !authUser &&
    loggedInUser.restaurant_id !== restaurantId;

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

  const refreshTables = useCallback(async () => {
    const [t, s] = await Promise.all([
      api.get<Table[]>(`/tables/?restaurant_id=${restaurantId}`),
      api.get<RestaurantStats>(`/restaurants/${restaurantId}/stats`),
    ]);
    setTables(t);
    setStats(s);
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
    const stored = getSessionForRestaurant(restaurantId);
    const sessionUser = getAuthUser();
    const restaurantUser = getAuthUserForRestaurant(restaurantId);

    if (stored && !stored.occupationId) {
      clearClientSession();
      setSession(null);
    } else if (stored && !restaurantUser) {
      // Session table d'un autre compte / restaurant : bloquer la commande
      clearClientSession();
      setSession(null);
      setCart([]);
    } else {
      setSession(stored);
    }

    setLoggedInUser(sessionUser);
    setAuthUserState(restaurantUser);
    setSwitchError("");
  }, [restaurantId]);

  function handleSignupSuccess(user: AuthUserResponse) {
    setAuthUser(user);
    setAuthUserState(user);
    setLoggedInUser(user);
  }

  async function handleLoginSuccess(user: AuthUserResponse) {
    if (user.restaurant_id && user.restaurant_id !== restaurantId) {
      setLoggedInUser(user);
      setAuthUserState(null);
      try {
        const switched = await changeRestaurant({
          user_id: user.id,
          restaurant_id: restaurantId,
        });
        setAuthUser(switched);
        setAuthUserState(switched);
        setLoggedInUser(switched);
        clearClientSession();
        setSession(null);
        setCart([]);
      } catch {
        setAuthUser(user);
        setLoggedInUser(user);
        setSwitchError(
          "Connecté, mais impossible de passer à ce restaurant. Réessayez.",
        );
      }
      return;
    }

    if (!user.restaurant_id) {
      try {
        const switched = await changeRestaurant({
          user_id: user.id,
          restaurant_id: restaurantId,
        });
        setAuthUser(switched);
        setAuthUserState(switched);
        setLoggedInUser(switched);
      } catch {
        setAuthUser(user);
        setAuthUserState(null);
        setLoggedInUser(user);
        setSwitchError(
          "Connecté, mais impossible de lier ce restaurant. Réessayez.",
        );
      }
      return;
    }

    setAuthUser(user);
    setAuthUserState(user);
    setLoggedInUser(user);
  }
  async function handleSwitchRestaurant(options?: {
    openJoinAfter?: boolean;
    table?: Table;
  }) {
    if (!loggedInUser) return;
    setSwitchingRestaurant(true);
    setSwitchError("");
    try {
      const user = await changeRestaurant({
        user_id: loggedInUser.id,
        restaurant_id: restaurantId,
      });
      setAuthUser(user);
      setAuthUserState(user);
      setLoggedInUser(user);
      clearClientSession();
      setSession(null);
      setCart([]);
      if (options?.openJoinAfter) {
        setJoinBlockedMessage("");
        setJoinTargetTable(options.table ?? null);
        setAccessCodeOpen(true);
      }
    } catch {
      setSwitchError(
        "Impossible de passer à ce restaurant. Réessayez.",
      );
    } finally {
      setSwitchingRestaurant(false);
    }
  }

  function handleLogout() {
    clearAuthUser();
    clearClientSession();
    setAuthUserState(null);
    setLoggedInUser(null);
    setSession(null);
    setCart([]);
    setProfileOpen(false);
    setSwitchError("");
  }

  function handleJoinSuccess(result: TableJoinResponse) {
    const newSession: ClientSession = {
      restaurantId,
      tableId: result.table_id,
      tableNumero: result.table_numero,
      occupationId: result.occupation_id,
      nombreDePlaces: result.nombre_de_places,
    };
    setClientSession(newSession);
    setSession(newSession);
    setJoinTargetTable(null);
    setActiveTab("menu");
    refreshTables().catch(() => undefined);
  }

  function openJoinModal(table?: Table) {
    if (!authUser) {
      if (canSwitchRestaurant) {
        handleSwitchRestaurant({ openJoinAfter: true, table });
        return;
      }
      setSignupOpen(true);
      return;
    }

    if (session) {
      if (table && table.id === session.tableId) {
        setJoinBlockedMessage(
          `Vous êtes déjà connecté à la table ${session.tableNumero}.`,
        );
      } else {
        const targetLabel = table
          ? `la table ${table.numero}`
          : "une autre table";
        setJoinBlockedMessage(
          `Vous êtes connecté à la table ${session.tableNumero}. Quittez la table avant de rejoindre ${targetLabel}.`,
        );
      }
      setActiveTab("tables");
      return;
    }
    setJoinBlockedMessage("");
    setJoinTargetTable(table ?? null);
    setAccessCodeOpen(true);
  }

  function requestLeaveTable() {
    if (!session) return;
    setLeaveConfirmOpen(true);
  }

  async function handleLeaveTable() {
    if (!session) return;
    setLeaving(true);
    try {
      await endOccupation(session.occupationId);
      clearClientSession();
      setSession(null);
      setCart([]);
      setJoinBlockedMessage("");
      setLeaveConfirmOpen(false);
      setActiveTab("tables");
      await refreshTables();
    } catch {
      setError("Impossible de quitter la table. Réessayez.");
    } finally {
      setLeaving(false);
    }
  }

  function addToCart(produit: Produit) {
    if (!authUser || !session) return;
    if (produit.restaurant_id !== restaurantId) return;
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
    if (!authUser || !session) return;
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
    if (!authUser || !session) return;
    const produit = produits.find((p) => p.id === produitId);
    if (produit) addToCart(produit);
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantite, 0);
  const hasSession = !!session;
  const canOrder = !!authUser && hasSession;
  const orderBlockedMessage = !authUser
    ? canSwitchRestaurant
      ? "Passez à ce restaurant pour commander"
      : "Connectez-vous à ce restaurant pour commander"
    : "Connectez-vous à une table pour commander";
  const profileUser = authUser ?? loggedInUser;

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
            ? `Table ${session.tableNumero} · ${session.nombreDePlaces} pers. · Connecté`
            : authUser
              ? `Compte : ${authUser.prenom ? `${authUser.prenom} ` : ""}${authUser.nom}`
              : canSwitchRestaurant
                ? `Connecté ailleurs · ${loggedInUser?.prenom ? `${loggedInUser.prenom} ` : ""}${loggedInUser?.nom}`
                : "Créez un compte pour réserver une place"
        }
        backHref="/"
        action={
          <div className="flex shrink-0 items-center gap-1">
            {profileUser && (
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                onClick={() => setProfileOpen(true)}
                aria-label="Mon profil"
              >
                <UserRound size={16} />
                <span className="hidden sm:inline">Profil</span>
              </Button>
            )}
            {hasSession && (
              <Button
                variant="ghost"
                className="hidden text-xs sm:inline-flex"
                onClick={requestLeaveTable}
                disabled={leaving}
              >
                <LogOut size={14} />
                {leaving ? "..." : "Quitter"}
              </Button>
            )}
          </div>
        }
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

        {hasSession && (
          <div className="mb-4 sm:hidden">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={requestLeaveTable}
              disabled={leaving}
            >
              <LogOut size={16} />
              {leaving ? "Déconnexion..." : "Quitter la table"}
            </Button>
          </div>
        )}

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

        {canSwitchRestaurant && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-secondary">
            <p className="mb-2">
              Vous êtes déjà connecté. Passez à{" "}
              <span className="font-medium text-foreground">
                {restaurant.nom}
              </span>{" "}
              pour réserver une place ici.
            </p>
            {switchError && (
              <p className="mb-2 text-sm text-danger">{switchError}</p>
            )}
            <Button
              size="sm"
              onClick={() => handleSwitchRestaurant()}
              disabled={switchingRestaurant}
            >
              <ArrowRightLeft size={14} />
              {switchingRestaurant
                ? "Changement..."
                : "Passer à ce restaurant"}
            </Button>
          </div>
        )}

        {!authUser && !canSwitchRestaurant && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-secondary">
            <p className="mb-2">
              Créez un compte ou connectez-vous pour vous abonner à ce restaurant
              et réserver une place.
            </p>
            {switchError && (
              <p className="mb-2 text-sm text-danger">{switchError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setSignupOpen(true)}>
                Créer mon compte
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setLoginOpen(true)}
              >
                Se connecter
              </Button>
            </div>
          </div>
        )}

        {authUser && !hasSession && activeTab !== "tables" && (
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
            canOrder={canOrder}
            orderBlockedMessage={orderBlockedMessage}
          />
        )}

        {activeTab === "tables" && (
          <TablesView
            tables={tables}
            selectedTableId={session?.tableId ?? null}
            hasActiveSession={hasSession}
            activeTableNumero={session?.tableNumero}
            joinBlockedMessage={joinBlockedMessage}
            onDismissJoinBlocked={() => setJoinBlockedMessage("")}
            onRequestJoin={(table) => openJoinModal(table)}
            onOpenAccessCode={() => openJoinModal()}
            onLeaveTable={requestLeaveTable}
            leaving={leaving}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesView categories={categories} produits={produits} />
        )}

        {activeTab === "order" && (
          canOrder ? (
            <CartPanel
              restaurantId={restaurantId}
              tableId={session!.tableId}
              tableNumero={session!.tableNumero}
              occupationId={session!.occupationId}
              cart={cart}
              onAdd={addById}
              onRemove={removeFromCart}
              onClear={() => setCart([])}
              existingOrders={orders}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-muted">{orderBlockedMessage}.</p>
              <button
                onClick={() => {
                  if (!authUser) {
                    if (canSwitchRestaurant) {
                      handleSwitchRestaurant();
                      return;
                    }
                    setSignupOpen(true);
                    return;
                  }
                  setActiveTab("tables");
                }}
                className="mt-3 text-sm font-medium text-primary underline"
              >
                {!authUser
                  ? canSwitchRestaurant
                    ? "Passer à ce restaurant"
                    : "Créer un compte ou se connecter"
                  : "Aller aux tables"}
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

      <SignupModal
        open={signupOpen}
        restaurantId={restaurantId}
        restaurantName={restaurant.nom}
        onClose={() => setSignupOpen(false)}
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />

      <LoginModal
        open={loginOpen}
        restaurantName={restaurant.nom}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      {profileUser && (
        <ProfileModal
          open={profileOpen}
          user={profileUser}
          restaurantName={
            authUser ? restaurant.nom : undefined
          }
          onClose={() => setProfileOpen(false)}
          onLogout={handleLogout}
        />
      )}

      <AccessCodeModal
        open={accessCodeOpen && !session && !!authUser}
        tables={tables}
        preselectedTable={joinTargetTable}
        blocked={!!session}
        blockedMessage={joinBlockedMessage}
        onClose={() => {
          setAccessCodeOpen(false);
          setJoinTargetTable(null);
        }}
        onSuccess={handleJoinSuccess}
      />

      {session && (
        <LeaveTableConfirmModal
          open={leaveConfirmOpen}
          tableNumero={session.tableNumero}
          leaving={leaving}
          onClose={() => setLeaveConfirmOpen(false)}
          onConfirm={handleLeaveTable}
        />
      )}
    </div>
  );
}
