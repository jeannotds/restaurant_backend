import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";

export function ClientHeader({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
        {backHref ? (
          <Link
            href={backHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-background hover:text-foreground"
            aria-label="Retour"
          >
            <ArrowLeft size={18} />
          </Link>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UtensilsCrossed size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-secondary">{title}</h1>
          {subtitle && (
            <p className="truncate text-sm text-muted">{subtitle}</p>
          )}
        </div>
        <Link
          href="/admin"
          className="hidden shrink-0 text-xs text-muted underline-offset-2 hover:text-foreground hover:underline sm:inline"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
