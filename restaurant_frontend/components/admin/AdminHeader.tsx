export function AdminHeader({ title }: { title?: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      <p className="text-sm text-muted">
        {title ?? "Gestion restaurant"}
      </p>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
          Admin
        </span>
      </div>
    </header>
  );
}
