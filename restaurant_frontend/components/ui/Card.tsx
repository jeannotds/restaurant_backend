export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs sm:text-sm text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-secondary sm:text-2xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-secondary sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {action && (
        <div className="w-full shrink-0 sm:w-auto [&_button]:w-full sm:[&_button]:w-auto [&_label]:w-full sm:[&_label]:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
