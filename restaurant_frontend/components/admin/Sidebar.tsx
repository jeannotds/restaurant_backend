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
  X,
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

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Fermer le menu"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-secondary text-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60">
              Restaurant QR
            </p>
            <p className="mt-1 text-lg font-semibold">Backoffice</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
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
          <Link href="/" className="mb-2 block hover:text-white/80">
            ← Interface client
          </Link>
          Phase 1 — Admin
        </div>
      </aside>
    </>
  );
}
