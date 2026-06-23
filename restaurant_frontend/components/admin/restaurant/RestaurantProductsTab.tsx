"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, ApiError, syncProduitImagesOnUpdate, uploadProduitImages } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Category, ImageReplacement, Produit } from "@/lib/types";
import { ProductImageField } from "@/components/admin/ProductImageField";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge, statusTone } from "@/components/ui/Badge";
import { TableContainer } from "@/components/ui/TableContainer";

type FormState = {
  nom: string;
  description: string;
  price: string;
  disponible: string;
  categorie_id: string;
};

export function RestaurantProductsTab({
  restaurantId,
  onDataChange,
}: {
  restaurantId: string;
  onDataChange?: () => void;
}) {
  const [items, setItems] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [error, setError] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [replacements, setReplacements] = useState<ImageReplacement[]>([]);
  const [form, setForm] = useState<FormState>({
    nom: "",
    description: "",
    price: "",
    disponible: "true",
    categorie_id: "",
  });

  function load() {
    setLoading(true);
    Promise.all([
      api.get<Produit[]>(`/produits/?restaurant_id=${restaurantId}`),
      api.get<Category[]>(`/categories/?restaurant_id=${restaurantId}`),
    ])
      .then(([prods, cats]) => {
        setItems(prods);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.nom ?? "—";
  }

  function openCreate() {
    setEditing(null);
    setPendingFiles([]);
    setReplacements([]);
    setForm({
      nom: "",
      description: "",
      price: "",
      disponible: "true",
      categorie_id: categories[0]?.id ?? "",
    });
    setOpen(true);
  }

  function openEdit(prod: Produit) {
    setEditing(prod);
    setPendingFiles([]);
    setReplacements([]);
    setForm({
      nom: prod.nom,
      description: prod.description ?? "",
      price: String(prod.price),
      disponible: String(prod.disponible),
      categorie_id: prod.categorie_id,
    });
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const payload = {
      nom: form.nom,
      description: form.description || null,
      price: Number(form.price),
      disponible: form.disponible === "true",
      categorie_id: form.categorie_id,
      restaurant_id: restaurantId,
    };
    try {
      if (editing) {
        await api.put(`/produits/${editing.id}`, payload);
        await syncProduitImagesOnUpdate(editing.id, {
          replacements,
          newFiles: pendingFiles,
        });
      } else {
        const created = await api.post<Produit>("/produits/", payload);
        if (pendingFiles.length > 0) {
          await uploadProduitImages(created.id, pendingFiles);
        }
      }
      setOpen(false);
      setPendingFiles([]);
      setReplacements([]);
      load();
      onDataChange?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/produits/${id}`);
      load();
      onDataChange?.();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erreur");
    }
  }

  if (loading) {
    return <p className="text-muted">Chargement des produits...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex sm:justify-end">
        <Button onClick={openCreate} disabled={categories.length === 0} className="w-full sm:w-auto">
          <Plus size={16} /> Nouveau produit
        </Button>
      </div>

      {categories.length === 0 && (
        <p className="mb-4 text-sm text-muted">
          Créez d&apos;abord une catégorie pour ajouter des produits.
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">Aucun produit pour ce restaurant.</p>
          {categories.length > 0 && (
            <Button className="mt-4" onClick={openCreate}>
              Créer un produit
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {items.map((prod) => (
              <div
                key={prod.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex gap-3">
                  {prod.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prod.images[0].url_image}
                      alt={prod.nom}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-background text-xs text-muted">
                      N/A
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-secondary">{prod.nom}</p>
                      <p className="shrink-0 font-semibold text-primary">
                        {formatPrice(prod.price)}
                      </p>
                    </div>
                    <p className="text-sm text-muted">
                      {categoryName(prod.categorie_id)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge tone={statusTone(String(prod.disponible))}>
                        {prod.disponible ? "Disponible" : "Indisponible"}
                      </Badge>
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <TableContainer minWidth="720px">
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
            </TableContainer>
          </div>
        </>
      )}

      <Modal
        open={open}
        title={editing ? "Modifier le produit" : "Nouveau produit"}
        onClose={() => setOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <ProductImageField
            existingImages={editing?.images}
            files={pendingFiles}
            onFilesChange={setPendingFiles}
            replacements={replacements}
            onReplacementsChange={setReplacements}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Enregistrement..."
                : editing
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
