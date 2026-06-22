"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TableContainer } from "@/components/ui/TableContainer";

export function RestaurantCategoriesTab({
  restaurantId,
  onDataChange,
}: {
  restaurantId: string;
  onDataChange?: () => void;
}) {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nom: "", description: "" });

  function load() {
    setLoading(true);
    api
      .get<Category[]>(`/categories/?restaurant_id=${restaurantId}`)
      .then(setItems)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  function openCreate() {
    setEditing(null);
    setForm({ nom: "", description: "" });
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      nom: cat.nom,
      description: cat.description ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      nom: form.nom,
      description: form.description || null,
      restaurant_id: restaurantId,
    };
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload);
      } else {
        await api.post("/categories/", payload);
      }
      setOpen(false);
      load();
      onDataChange?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue");
    }
  }

  if (loading) {
    return <p className="text-muted">Chargement des catégories...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex sm:justify-end">
        <Button onClick={openCreate}>
          <Plus size={16} /> Nouvelle catégorie
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">Aucune catégorie pour ce restaurant.</p>
          <Button className="mt-4" onClick={openCreate}>
            Créer une catégorie
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {items.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-secondary">{cat.nom}</p>
                    <p className="mt-1 text-sm text-muted">
                      {cat.description ?? "—"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                    <Pencil size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <TableContainer>
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((cat) => (
                  <tr key={cat.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{cat.nom}</td>
                    <td className="px-4 py-3 text-muted">
                      {cat.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                        <Pencil size={14} /> Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </div>
        </>
      )}

      <Modal
        open={open}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom"
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
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
