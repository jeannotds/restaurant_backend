"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Restaurant, Table } from "@/lib/types";
import { PageHeader } from "@/components/ui/Card";
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
  restaurant_id: string;
};

const emptyForm: FormState = {
  numero: "",
  capacity: "",
  status: "LIBRE",
  code_acces: "",
  restaurant_id: "",
};

export default function TablesPage() {
  const [items, setItems] = useState<Table[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);

  function load() {
    Promise.all([
      api.get<Table[]>("/tables/"),
      api.get<Restaurant[]>("/restaurants/"),
    ])
      .then(([tables, rests]) => {
        setItems(tables);
        setRestaurants(rests);
        if (rests[0] && !form.restaurant_id) {
          setForm((f) => ({ ...f, restaurant_id: rests[0].id }));
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      restaurant_id: restaurants[0]?.id ?? "",
    });
    setOpen(true);
  }

  function openEdit(table: Table) {
    setEditing(table);
    setForm({
      numero: String(table.numero),
      capacity: String(table.capacity),
      status: table.status,
      code_acces: table.code_acces ?? "",
      restaurant_id: table.restaurant_id,
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
      restaurant_id: form.restaurant_id,
    };
    try {
      if (editing) {
        await api.put(`/tables/${editing.id}`, payload);
      } else {
        await api.post("/tables/", payload);
      }
      setOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div>
      <PageHeader
        title="Tables"
        description="Gérez les tables et leurs statuts"
        action={
          <Button onClick={openCreate} disabled={restaurants.length === 0}>
            <Plus size={16} /> Nouvelle table
          </Button>
        }
      />

      {loading ? (
        <p className="text-muted">Chargement...</p>
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
          <Select
            label="Restaurant"
            value={form.restaurant_id}
            onChange={(e) =>
              setForm({ ...form, restaurant_id: e.target.value })
            }
            options={restaurants.map((r) => ({
              value: r.id,
              label: r.nom,
            }))}
          />
          <div className="grid grid-cols-2 gap-4">
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
