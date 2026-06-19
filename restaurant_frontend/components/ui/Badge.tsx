import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  default: "bg-border/60 text-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  secondary: "bg-secondary/10 text-secondary",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof tones {
  const map: Record<string, keyof typeof tones> = {
    LIBRE: "success",
    OCCUPEE: "warning",
    RESERVEE: "info",
    EN_ATTENTE: "default",
    EN_PREPARATION: "warning",
    PRETE: "info",
    SERVIE: "success",
    PAYEE: "success",
    ANNULEE: "danger",
    true: "success",
    false: "danger",
  };
  return map[status] ?? "default";
}
