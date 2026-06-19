"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Grid3X3,
  FolderOpen,
  UtensilsCrossed,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/restaurants", label: "Restaurants", icon: Store },
  { href: "/admin/tables", label: "Tables", icon: Grid3X3 },
  { href: "/admin/categories", label: "Catégories", icon: FolderOpen },
  { href: "/admin/products", label: "Produits", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Commandes", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-secondary text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-xs uppercase tracking-wider text-white/60">
          Restaurant QR
        </p>
        <p className="mt-1 text-lg font-semibold">Backoffice</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-primary text-white"
                  : "text-white/80 hover:bg-white/10",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-white/50">
        Phase 1 — Admin
      </div>
    </aside>
  );
}
