"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import type { AuthUserResponse } from "@/lib/types";
import { ApiError, signup } from "@/lib/api";
import { setAuthSession } from "@/lib/auth-session";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface SignupModalProps {
  open: boolean;
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
  onSuccess: (user: AuthUserResponse) => void;
  onSwitchToLogin?: () => void;
}

function formatApiDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item && "msg" in item
          ? String((item as { msg: string }).msg)
          : String(item),
      )
      .join(" · ");
  }
  return "Impossible de créer le compte.";
}

export function SignupModal({
  open,
  restaurantId,
  restaurantName,
  onClose,
  onSuccess,
  onSwitchToLogin,
}: SignupModalProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setNom("");
      setPrenom("");
      setEmail("");
      setTelephone("");
      setPassword("");
      setError("");
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedNom = nom.trim();
    const trimmedEmail = email.trim();
    const trimmedTelephone = telephone.trim();

    if (!trimmedNom) {
      setError("Le nom est requis.");
      return;
    }
    if (!trimmedEmail && !trimmedTelephone) {
      setError("Indiquez un email ou un téléphone.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setSubmitting(true);
    try {
      const { user, access_token } = await signup({
        nom: trimmedNom,
        prenom: prenom.trim() || null,
        email: trimmedEmail || null,
        telephone: trimmedTelephone || null,
        password,
        restaurant_id: restaurantId,
      });
      setAuthSession(user, access_token);
      onSuccess(user);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(formatApiDetail(err.message));
      } else {
        setError("Impossible de créer le compte.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setError("");
    onClose();
  }

  return (
    <Modal open={open} title="Créer un compte" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-background p-3">
          <UserPlus size={20} className="shrink-0 text-primary" />
          <p className="text-sm text-muted">
            Créez votre compte pour vous abonner à{" "}
            <span className="font-medium text-foreground">{restaurantName}</span>{" "}
            et réserver une place.
          </p>
        </div>

        <Input
          label="Nom"
          placeholder="Ex: Mbula"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          autoFocus
          required
        />

        <Input
          label="Prénom"
          placeholder="Ex: Adonai"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="ex: vous@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Téléphone"
          type="tel"
          placeholder="Ex: 0612345678"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="Au moins 6 caractères"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          error={error}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {onSwitchToLogin ? (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-left text-sm text-primary underline"
            >
              Déjà un compte ? Se connecter
            </button>
          ) : (
            <span />
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Création..." : "Créer mon compte"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
