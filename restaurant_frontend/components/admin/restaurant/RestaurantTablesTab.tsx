"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Table } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge, statusTone } from "@/components/ui/Badge";

const STATUS_OPTIONS = [
  { value: "LIBRE", label: "Libre" },
  { value: "OCCUPEE", label: "Occupée" },
  { value: "RESERVEE", label: "Réservée" },
];

type FormState = {
  numero: string;
  capacity: string;
  status: string;
  code_acces: string;
};

const emptyForm: FormState = {
  numero: "",
  capacity: "",
  status: "LIBRE",
  code_acces: "",
};

export function RestaurantTablesTab({
  restaurantId,
  onDataChange,
}: {
  restaurantId: string;
  onDataChange?: () => void;
}) {
  const [items, setItems] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);

  function load() {
    setLoading(true);
    api
      .get<Table[]>(`/tables/?restaurant_id=${restaurantId}`)
      .then(setItems)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(table: Table) {
    setEditing(table);
    setForm({
      numero: String(table.numero),
      capacity: String(table.capacity),
      status: table.status,
      code_acces: table.code_acces ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      numero: Number(form.numero),
      capacity: Number(form.capacity),
      status: form.status,
      code_acces: form.code_acces || null,
      restaurant_id: restaurantId,
    };
    try {
      if (editing) {
        await api.put(`/tables/${editing.id}`, payload);
      } else {
        await api.post("/tables/", payload);
      }
      setOpen(false);
      load();
      onDataChange?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue");
    }
  }

  if (loading) {
    return <p className="text-muted">Chargement des tables...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex sm:justify-end">
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus size={16} /> Nouvelle table
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">Aucune table pour ce restaurant.</p>
          <Button className="mt-4" onClick={openCreate}>
            Créer une table
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((table) => (
            <div
              key={table.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-secondary">
                    Table {table.numero}
                  </p>
                  <p className="text-sm text-muted">{table.capacity} places</p>
                </div>
                <Badge tone={statusTone(table.status)}>{table.status}</Badge>
              </div>
              {table.code_acces && (
                <p className="mt-3 text-xs text-muted">
                  PIN : <span className="font-mono">{table.code_acces}</span>
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => openEdit(table)}
              >
                <Pencil size={14} /> Modifier
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? "Modifier la table" : "Nouvelle table"}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Numéro"
              type="number"
              required
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
            />
            <Input
              label="Capacité"
              type="number"
              required
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
          </div>
          <Select
            label="Statut"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={STATUS_OPTIONS}
          />
          <Input
            label="Code d'accès (PIN)"
            value={form.code_acces}
            onChange={(e) => setForm({ ...form, code_acces: e.target.value })}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">{editing ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
