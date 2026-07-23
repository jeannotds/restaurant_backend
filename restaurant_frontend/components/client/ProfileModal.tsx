"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import type { AuthUserResponse, Restaurant } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ProfileModalProps {
  open: boolean;
  user: AuthUserResponse;
  /** Nom déjà connu (optionnel) — sinon résolu via user.restaurant_id */
  restaurantName?: string;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileModal({
  open,
  user,
  restaurantName,
  onClose,
  onLogout,
}: ProfileModalProps) {
  const [resolvedRestaurantName, setResolvedRestaurantName] = useState<
    string | null
  >(restaurantName ?? null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(false);

  const fullName = `${user.prenom ? `${user.prenom} ` : ""}${user.nom}`.trim();

  useEffect(() => {
    if (!open) return;

    if (restaurantName) {
      setResolvedRestaurantName(restaurantName);
      return;
    }

    if (!user.restaurant_id) {
      setResolvedRestaurantName(null);
      return;
    }

    let cancelled = false;
    setLoadingRestaurant(true);
    api
      .get<Restaurant>(`/restaurants/${user.restaurant_id}`)
      .then((restaurant) => {
        if (!cancelled) setResolvedRestaurantName(restaurant.nom);
      })
      .catch(() => {
        if (!cancelled) setResolvedRestaurantName(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingRestaurant(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, user.restaurant_id, restaurantName]);

  const currentRestaurantLabel = !user.restaurant_id
    ? "Aucun restaurant lié"
    : loadingRestaurant
      ? "Chargement du restaurant..."
      : resolvedRestaurantName
        ? `Restaurant actuel : ${resolvedRestaurantName}`
        : "Restaurant actuel introuvable";

  return (
    <Modal open={open} title="Mon profil" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-background p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound size={22} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{fullName}</p>
            <p className="text-sm text-muted">{currentRestaurantLabel}</p>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          {user.email && (
            <div className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="break-all text-foreground">{user.email}</dd>
              </div>
            </div>
          )}
          {user.telephone && (
            <div className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <dt className="text-muted">Téléphone</dt>
                <dd className="text-foreground">{user.telephone}</dd>
              </div>
            </div>
          )}
          {!user.email && !user.telephone && (
            <p className="text-muted">Aucun contact renseigné.</p>
          )}
        </dl>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          <Button type="button" variant="danger" onClick={onLogout}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </Modal>
  );
}
