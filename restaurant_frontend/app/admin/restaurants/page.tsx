"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Restaurant } from "@/lib/types";
import { PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TableContainer } from "@/components/ui/TableContainer";

export default function RestaurantsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nom: "", adresse: "", telephone: "" });

  function load() {
    api
      .get<Restaurant[]>("/restaurants/")
      .then(setItems)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/restaurants/", form);
      setOpen(false);
      setForm({ nom: "", adresse: "", telephone: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div>
      <PageHeader
        title="Restaurants"
        description="Gérez les établissements de votre plateforme"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Nouveau restaurant
          </Button>
        }
      />

      {loading ? (
        <p className="text-muted">Chargement...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">Aucun restaurant. Créez le premier.</p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            Créer un restaurant
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {items.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => router.push(`/admin/restaurants/${r.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition hover:bg-background"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                  {r.nom.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-secondary">{r.nom}</p>
                  <p className="truncate text-sm text-muted">{r.adresse}</p>
                  <p className="text-sm text-muted">{r.telephone}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <TableContainer>
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Adresse</th>
                  <th className="px-4 py-3 font-medium">Téléphone</th>
                  <th className="px-4 py-3 w-10" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/admin/restaurants/${r.id}`)}
                    className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-background"
                  >
                    <td className="px-4 py-3 font-medium">{r.nom}</td>
                    <td className="px-4 py-3 text-muted">{r.adresse}</td>
                    <td className="px-4 py-3">{r.telephone}</td>
                    <td className="px-4 py-3 text-muted">
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </div>
        </>
      )}

      <Modal open={open} title="Nouveau restaurant" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom"
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <Input
            label="Adresse"
            required
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
          />
          <Input
            label="Téléphone"
            required
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
