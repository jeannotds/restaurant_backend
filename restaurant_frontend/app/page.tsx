"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { api, ApiError, fetchCurrentUser } from "@/lib/api";
import type { AuthUserResponse, Restaurant } from "@/lib/types";
import {
  clearAuthUser,
  getAccessToken,
  getAuthUser,
  setAuthUser,
} from "@/lib/auth-session";
import { clearClientSession } from "@/lib/client-session";
import { ClientHeader } from "@/components/client/ClientHeader";
import { RestaurantCard } from "@/components/client/RestaurantCard";
import { ProfileModal } from "@/components/client/ProfileModal";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authUser, setAuthUserState] = useState<AuthUserResponse | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const localUser = getAuthUser();

    if (!token) {
      setAuthUserState(null);
      return;
    }

    if (localUser) setAuthUserState(localUser);

    fetchCurrentUser()
      .then((user) => {
        setAuthUser(user);
        setAuthUserState(user);
      })
      .catch(() => {
        clearAuthUser();
        setAuthUserState(null);
      });
  }, []);

  useEffect(() => {
    api
      .get<Restaurant[]>("/restaurants/", false)
      .then(setRestaurants)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Impossible de charger les restaurants.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearAuthUser();
    clearClientSession();
    setAuthUserState(null);
    setProfileOpen(false);
  }

  const currentRestaurant = authUser?.restaurant_id
    ? restaurants.find((r) => r.id === authUser.restaurant_id)
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader
        title="Restaurant QR"
        subtitle={
          authUser
            ? currentRestaurant
              ? `${authUser.prenom ? `${authUser.prenom} ` : ""}${authUser.nom} · ${currentRestaurant.nom}`
              : `Compte : ${authUser.prenom ? `${authUser.prenom} ` : ""}${authUser.nom}`
            : "Choisissez votre restaurant"
        }
        action={
          authUser ? (
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
          ) : undefined
        }
      />

      <main className="mx-auto max-w-3xl px-3 py-5 sm:px-4 sm:py-6">
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

      {authUser && (
        <ProfileModal
          open={profileOpen}
          user={authUser}
          restaurantName={currentRestaurant?.nom}
          onClose={() => setProfileOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
