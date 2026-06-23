"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Users } from "lucide-react";
import type { Table, TableJoinResponse } from "@/lib/types";
import { ApiError, joinTable } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface AccessCodeModalProps {
  open: boolean;
  tables: Table[];
  preselectedTable?: Table | null;
  blocked?: boolean;
  blockedMessage?: string;
  onClose: () => void;
  onSuccess: (result: TableJoinResponse) => void;
}

function placesLibres(table: Table): number {
  return Math.max(0, table.capacity - (table.places_occupees ?? 0));
}

export function AccessCodeModal({
  open,
  tables,
  preselectedTable,
  blocked = false,
  blockedMessage,
  onClose,
  onSuccess,
}: AccessCodeModalProps) {
  const [code, setCode] = useState("");
  const [nombreDePlaces, setNombreDePlaces] = useState("1");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setNombreDePlaces("1");
      setError("");
    }
  }, [open, preselectedTable?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (blocked) {
      setError(blockedMessage ?? "Quittez votre table actuelle avant d'en rejoindre une autre.");
      return;
    }

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Veuillez entrer un code.");
      return;
    }

    const places = parseInt(nombreDePlaces, 10);
    if (!places || places < 1) {
      setError("Indiquez au moins 1 personne.");
      return;
    }

    let table = preselectedTable ?? null;
    if (!table) {
      table =
        tables.find((t) => t.code_acces?.toUpperCase() === normalized) ?? null;
      if (!table) {
        setError("Code invalide. Vérifiez le code affiché sur votre table.");
        return;
      }
    }

    if (table.status === "RESERVEE") {
      setError("Cette table est réservée.");
      return;
    }

    const libres = placesLibres(table);
    if (places > libres) {
      setError(`Places insuffisantes. ${libres} place(s) libre(s) sur cette table.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await joinTable(table.id, {
        code_acces: normalized,
        nombre_de_places: places,
      });
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de rejoindre la table.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setCode("");
    setNombreDePlaces("1");
    setError("");
    onClose();
  }

  const maxPlaces = preselectedTable
    ? placesLibres(preselectedTable)
    : undefined;

  return (
    <Modal
      open={open}
      title={
        preselectedTable
          ? `Rejoindre la table ${preselectedTable.numero}`
          : "Code d'accès table"
      }
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-background p-3">
          <KeyRound size={20} className="text-primary" />
          <p className="text-sm text-muted">
            {preselectedTable
              ? `Entrez le code de la table ${preselectedTable.numero} et le nombre de personnes.`
              : "Entrez le code affiché sur votre table ou reçu via le QR code."}
          </p>
        </div>

        {preselectedTable && maxPlaces !== undefined && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted">
            <Users size={16} />
            {preselectedTable.places_occupees ?? 0}/{preselectedTable.capacity}{" "}
            places occupées · {maxPlaces} libre(s)
          </div>
        )}

        <Input
          label="Code d'accès"
          placeholder="Ex: ABC123"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoFocus
        />

        <Input
          label="Nombre de personnes"
          type="number"
          min={1}
          max={maxPlaces}
          placeholder="Ex: 2"
          value={nombreDePlaces}
          onChange={(e) => setNombreDePlaces(e.target.value)}
          error={error}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Connexion..." : "Rejoindre la table"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
