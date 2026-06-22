"use client";

import { Armchair, KeyRound, Users } from "lucide-react";
import type { Table } from "@/lib/types";
import { Badge, statusTone } from "@/components/ui/Badge";
import { labelTableStatus } from "@/lib/labels";
import { cn } from "@/lib/utils";

interface TablesViewProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (table: Table) => void;
  onOpenAccessCode: () => void;
}

export function TablesView({
  tables,
  selectedTableId,
  onSelectTable,
  onOpenAccessCode,
}: TablesViewProps) {
  const sorted = [...tables].sort((a, b) => a.numero - b.numero);

  const libres = sorted.filter((t) => t.status === "LIBRE");
  const occupees = sorted.filter((t) => t.status === "OCCUPEE");
  const reservees = sorted.filter((t) => t.status === "RESERVEE");

  return (
    <div className="space-y-6">
      <button
        onClick={onOpenAccessCode}
        className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-left transition hover:border-primary hover:bg-primary/10"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <KeyRound size={20} />
        </div>
        <div>
          <p className="font-medium text-secondary">Entrer le code d&apos;accès</p>
          <p className="text-sm text-muted">
            Scannez le QR ou saisissez le code affiché sur votre table
          </p>
        </div>
      </button>

      <TableGroup
        title="Tables libres"
        hint={`${libres.length} disponible(s)`}
        tables={libres}
        selectedTableId={selectedTableId}
        onSelectTable={onSelectTable}
      />
      <TableGroup
        title="Tables occupées"
        hint={`${occupees.length} en service`}
        tables={occupees}
        selectedTableId={selectedTableId}
        onSelectTable={onSelectTable}
      />
      {reservees.length > 0 && (
        <TableGroup
          title="Tables réservées"
          hint={`${reservees.length} réservée(s)`}
          tables={reservees}
          selectedTableId={selectedTableId}
          onSelectTable={onSelectTable}
        />
      )}
    </div>
  );
}

function TableGroup({
  title,
  hint,
  tables,
  selectedTableId,
  onSelectTable,
}: {
  title: string;
  hint: string;
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (table: Table) => void;
}) {
  if (tables.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-semibold text-secondary">{title}</h3>
        <span className="text-xs text-muted">{hint}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onSelectTable(table)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition",
              selectedTableId === table.id
                ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                : "border-border bg-surface hover:border-primary/40",
            )}
          >
            <Armchair
              size={24}
              className={
                table.status === "LIBRE"
                  ? "text-success"
                  : table.status === "OCCUPEE"
                    ? "text-warning"
                    : "text-info"
              }
            />
            <span className="text-lg font-bold text-secondary">
              Table {table.numero}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Users size={12} />
              {table.capacity} places
            </span>
            <Badge tone={statusTone(table.status)}>
              {labelTableStatus(table.status)}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
