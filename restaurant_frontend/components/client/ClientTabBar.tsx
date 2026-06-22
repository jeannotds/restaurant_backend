"use client";

import { BookOpen, LayoutGrid, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export type ClientTab = "menu" | "tables" | "categories" | "order";

const TABS: { id: ClientTab; label: string; icon: typeof UtensilsCrossed }[] = [
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "tables", label: "Tables", icon: LayoutGrid },
  { id: "categories", label: "Catégories", icon: BookOpen },
  { id: "order", label: "Commander", icon: ShoppingCart },
];

export function ClientTabBar({
  active,
  onChange,
  cartCount,
}: {
  active: ClientTab;
  onChange: (tab: ClientTab) => void;
  cartCount: number;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition",
              active === id ? "text-primary" : "text-muted hover:text-foreground",
            )}
          >
            <Icon size={20} />
            {label}
            {id === "order" && cartCount > 0 && (
              <span className="absolute right-1/4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
