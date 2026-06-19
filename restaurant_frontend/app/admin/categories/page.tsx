"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Category, Restaurant } from "@/lib/types";
import { PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "",
    description: "",
    restaurant_id: "",
  });

  function load() {
    Promise.all([
      api.get<Category[]>("/categories/"),
      api.get<Restaurant[]>("/restaurants/"),
    ])
      .then(([cats, rests]) => {
        setItems(cats);
        setRestaurants(rests);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      nom: "",
      description: "",
      restaurant_id: restaurants[0]?.id ?? "",
    });
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      nom: cat.nom,
      description: cat.description ?? "",
      restaurant_id: cat.restaurant_id,
    });
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      nom: form.nom,
      description: form.description || null,
      restaurant_id: form.restaurant_id,
    };
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload);
      } else {
        await api.post("/categories/", payload);
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
        title="Catégories"
        description="Organisez votre menu par catégories"
        action={
          <Button onClick={openCreate} disabled={restaurants.length === 0}>
            <Plus size={16} /> Nouvelle catégorie
          </Button>
        }
      />

      {loading ? (
        <p className="text-muted">Chargement...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
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
          </table>
        </div>
      )}

      <Modal
        open={open}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
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
