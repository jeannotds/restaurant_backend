"use client";

import { Mail, Phone, UserRound } from "lucide-react";
import type { AuthUserResponse } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ProfileModalProps {
  open: boolean;
  user: AuthUserResponse;
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
  const fullName = `${user.prenom ? `${user.prenom} ` : ""}${user.nom}`.trim();

  return (
    <Modal open={open} title="Mon profil" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-background p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound size={22} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{fullName}</p>
            <p className="text-sm text-muted">
              {restaurantName
                ? `Restaurant actuel : ${restaurantName}`
                : "Aucun restaurant lié"}
            </p>
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
