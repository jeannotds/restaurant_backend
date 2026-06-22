"use client";

import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import type { Table } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface AccessCodeModalProps {
  open: boolean;
  tables: Table[];
  onClose: () => void;
  onSuccess: (table: Table) => void;
}

export function AccessCodeModal({
  open,
  tables,
  onClose,
  onSuccess,
}: AccessCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Veuillez entrer un code.");
      return;
    }

    const table = tables.find(
      (t) => t.code_acces?.toUpperCase() === normalized,
    );

    if (!table) {
      setError("Code invalide. Vérifiez le code affiché sur votre table.");
      return;
    }

    setCode("");
    onSuccess(table);
    onClose();
  }

  function handleClose() {
    setCode("");
    setError("");
    onClose();
  }

  return (
    <Modal open={open} title="Code d'accès table" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-background p-3">
          <KeyRound size={20} className="text-primary" />
          <p className="text-sm text-muted">
            Entrez le code affiché sur votre table ou reçu via le QR code.
          </p>
        </div>
        <Input
          label="Code d'accès"
          placeholder="Ex: ABC123"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoFocus
          error={error}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit">Valider</Button>
        </div>
      </form>
    </Modal>
  );
}
