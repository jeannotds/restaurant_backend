"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Category, Produit, Restaurant } from "@/lib/types";
import { PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge, statusTone } from "@/components/ui/Badge";

type FormState = {
  nom: string;
  description: string;
  price: string;
  disponible: string;
  categorie_id: string;
  restaurant_id: string;
  images: string;
};

export default function ProductsPage() {
  const [items, setItems] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    nom: "",
    description: "",
    price: "",
    disponible: "true",
    categorie_id: "",
    restaurant_id: "",
    images: "",
  });

  function load() {
    Promise.all([
      api.get<Produit[]>("/produits/"),
      api.get<Category[]>("/categories/"),
      api.get<Restaurant[]>("/restaurants/"),
    ])
      .then(([prods, cats, rests]) => {
        setItems(prods);
        setCategories(cats);
        setRestaurants(rests);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.nom ?? "—";
  }

  function openCreate() {
    setEditing(null);
    setForm({
      nom: "",
      description: "",
      price: "",
      disponible: "true",
      categorie_id: categories[0]?.id ?? "",
      restaurant_id: restaurants[0]?.id ?? "",
      images: "",
    });
    setOpen(true);
  }

  function openEdit(prod: Produit) {
    setEditing(prod);
    setForm({
      nom: prod.nom,
      description: prod.description ?? "",
      price: String(prod.price),
      disponible: String(prod.disponible),
      categorie_id: prod.categorie_id,
      restaurant_id: prod.restaurant_id,
      images: prod.images.map((i) => i.url_image).join("\n"),
    });
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const imageList = form.images
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    const payload = {
      nom: form.nom,
      description: form.description || null,
      price: Number(form.price),
      disponible: form.disponible === "true",
      categorie_id: form.categorie_id,
      restaurant_id: form.restaurant_id,
      images: imageList.length > 0 ? imageList : null,
    };
    try {
      if (editing) {
        await api.put(`/produits/${editing.id}`, payload);
      } else {
        await api.post("/produits/", payload);
      }
      setOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/produits/${id}`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur");
    }
  }

  return (
    <div>
      <PageHeader
        title="Produits"
        description="Gérez votre carte et les images"
        action={
          <Button
            onClick={openCreate}
            disabled={categories.length === 0 || restaurants.length === 0}
          >
            <Plus size={16} /> Nouveau produit
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
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((prod) => (
                <tr key={prod.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {prod.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.images[0].url_image}
                          alt={prod.nom}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-xs text-muted">
                          N/A
                        </div>
                      )}
                      <span className="font-medium">{prod.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {categoryName(prod.categorie_id)}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {formatPrice(prod.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(String(prod.disponible))}>
                      {prod.disponible ? "Disponible" : "Indisponible"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(prod)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(prod.id)}
                      >
                        <Trash2 size={14} className="text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        title={editing ? "Modifier le produit" : "Nouveau produit"}
        onClose={() => setOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
            <Select
              label="Catégorie"
              value={form.categorie_id}
              onChange={(e) =>
                setForm({ ...form, categorie_id: e.target.value })
              }
              options={categories.map((c) => ({
                value: c.id,
                label: c.nom,
              }))}
            />
          </div>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Prix"
              type="number"
              required
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Select
              label="Disponibilité"
              value={form.disponible}
              onChange={(e) =>
                setForm({ ...form, disponible: e.target.value })
              }
              options={[
                { value: "true", label: "Disponible" },
                { value: "false", label: "Indisponible" },
              ]}
            />
          </div>
          <Textarea
            label="URLs images (une par ligne)"
            placeholder="https://example.com/image.jpg"
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
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
