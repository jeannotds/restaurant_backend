import Link from "next/link";
import { ChevronRight, MapPin, Phone } from "lucide-react";
import type { Restaurant } from "@/lib/types";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
        {restaurant.nom.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-secondary group-hover:text-primary">
          {restaurant.nom}
        </h2>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
          <MapPin size={13} className="shrink-0" />
          {restaurant.adresse}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
          <Phone size={13} className="shrink-0" />
          {restaurant.telephone}
        </p>
      </div>
      <ChevronRight
        size={20}
        className="shrink-0 text-muted transition group-hover:text-primary"
      />
    </Link>
  );
}
