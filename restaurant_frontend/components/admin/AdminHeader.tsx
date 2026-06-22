import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AdminHeader({
  title,
  onMenuClick,
}: {
  title?: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </Button>
        <p className="truncate text-sm text-muted">
          {title ?? "Gestion restaurant"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/"
          className="hidden text-xs text-muted hover:text-foreground sm:inline"
        >
          Client
        </Link>
        <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
          Admin
        </span>
      </div>
    </header>
  );
}
