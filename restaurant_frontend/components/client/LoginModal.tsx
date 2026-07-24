"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import type { AuthUserResponse } from "@/lib/types";
import { ApiError, login } from "@/lib/api";
import { setAuthSession } from "@/lib/auth-session";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface LoginModalProps {
  open: boolean;
  restaurantName: string;
  onClose: () => void;
  onSuccess: (user: AuthUserResponse) => void;
  onSwitchToSignup?: () => void;
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
  return "Impossible de se connecter.";
}

export function LoginModal({
  open,
  restaurantName,
  onClose,
  onSuccess,
  onSwitchToSignup,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setTelephone("");
      setPassword("");
      setError("");
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedTelephone = telephone.trim();

    if (!trimmedEmail && !trimmedTelephone) {
      setError("Indiquez un email ou un téléphone.");
      return;
    }
    if (!password) {
      setError("Le mot de passe est requis.");
      return;
    }

    setSubmitting(true);
    try {
      const { user, access_token } = await login({
        email: trimmedEmail || null,
        telephone: trimmedTelephone || null,
        password,
      });
      setAuthSession(user, access_token);
      onSuccess(user);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(formatApiDetail(err.message));
      } else {
        setError("Impossible de se connecter.");
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
    <Modal open={open} title="Se connecter" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-background p-3">
          <LogIn size={20} className="shrink-0 text-primary" />
          <p className="text-sm text-muted">
            Connectez-vous pour rejoindre{" "}
            <span className="font-medium text-foreground">{restaurantName}</span>.
          </p>
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="ex: vous@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
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
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={error}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {onSwitchToSignup ? (
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-left text-sm text-primary underline"
            >
              Créer un compte
            </button>
          ) : (
            <span />
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
