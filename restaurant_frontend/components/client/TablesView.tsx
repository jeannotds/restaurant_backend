"use client";

import { Armchair, KeyRound, LogOut, Users, X } from "lucide-react";
import type { Table } from "@/lib/types";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { labelTableStatus } from "@/lib/labels";
import { cn } from "@/lib/utils";

interface TablesViewProps {
  tables: Table[];
  selectedTableId: string | null;
  hasActiveSession: boolean;
  activeTableNumero?: number;
  joinBlockedMessage?: string;
  onDismissJoinBlocked?: () => void;
  onRequestJoin: (table: Table) => void;
  onOpenAccessCode: () => void;
  onLeaveTable?: () => void;
  leaving?: boolean;
}

function placesLibres(table: Table): number {
  return Math.max(0, table.capacity - (table.places_occupees ?? 0));
}

function canJoin(table: Table): boolean {
  return table.status !== "RESERVEE" && placesLibres(table) > 0;
}

export function TablesView({
  tables,
  selectedTableId,
  hasActiveSession,
  activeTableNumero,
  joinBlockedMessage,
  onDismissJoinBlocked,
  onRequestJoin,
  onOpenAccessCode,
  onLeaveTable,
  leaving,
}: TablesViewProps) {
  const sorted = [...tables].sort((a, b) => a.numero - b.numero);

  const libres = sorted.filter((t) => t.status === "LIBRE");
  const partielles = sorted.filter((t) => t.status === "PARTIELLE");
  const occupees = sorted.filter((t) => t.status === "OCCUPEE");
  const reservees = sorted.filter((t) => t.status === "RESERVEE");

  return (
    <div className="space-y-6">
      {hasActiveSession && activeTableNumero !== undefined && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="font-medium text-secondary">
            Vous êtes connecté à la table {activeTableNumero}
          </p>
          <p className="mt-1 text-sm text-muted">
            Pour rejoindre une autre table, quittez d&apos;abord votre session
            actuelle.
          </p>
          {onLeaveTable && (
            <Button
              variant="ghost"
              className="mt-3 w-full sm:w-auto"
              onClick={onLeaveTable}
              disabled={leaving}
            >
              <LogOut size={16} />
              {leaving ? "Déconnexion..." : "Quitter la table"}
            </Button>
          )}
        </div>
      )}

      {joinBlockedMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          <p className="flex-1">{joinBlockedMessage}</p>
          {onDismissJoinBlocked && (
            <button
              type="button"
              onClick={onDismissJoinBlocked}
              className="shrink-0 rounded p-1 hover:bg-warning/20"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={hasActiveSession}
        onClick={() => !hasActiveSession && onOpenAccessCode()}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 text-left transition",
          hasActiveSession
            ? "cursor-not-allowed border-border bg-background opacity-60"
            : "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10",
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            hasActiveSession
              ? "bg-border text-muted"
              : "bg-primary/15 text-primary",
          )}
        >
          <KeyRound size={20} />
        </div>
        <div>
          <p className="font-medium text-secondary">Entrer le code d&apos;accès</p>
          <p className="text-sm text-muted">
            {hasActiveSession
              ? "Quittez votre table actuelle pour en rejoindre une autre"
              : "Scannez le QR ou saisissez le code affiché sur votre table"}
          </p>
        </div>
      </button>

      <TableGroup
        title="Tables libres"
        hint={`${libres.length} disponible(s)`}
        tables={libres}
        selectedTableId={selectedTableId}
        hasActiveSession={hasActiveSession}
        onRequestJoin={onRequestJoin}
      />
      <TableGroup
        title="Tables partiellement occupées"
        hint={`${partielles.length} avec places libres`}
        tables={partielles}
        selectedTableId={selectedTableId}
        hasActiveSession={hasActiveSession}
        onRequestJoin={onRequestJoin}
      />
      <TableGroup
        title="Tables occupées"
        hint={`${occupees.length} complète(s)`}
        tables={occupees}
        selectedTableId={selectedTableId}
        hasActiveSession={hasActiveSession}
        onRequestJoin={onRequestJoin}
      />
      {reservees.length > 0 && (
        <TableGroup
          title="Tables réservées"
          hint={`${reservees.length} réservée(s)`}
          tables={reservees}
          selectedTableId={selectedTableId}
          hasActiveSession={hasActiveSession}
          onRequestJoin={onRequestJoin}
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
  hasActiveSession,
  onRequestJoin,
}: {
  title: string;
  hint: string;
  tables: Table[];
  selectedTableId: string | null;
  hasActiveSession: boolean;
  onRequestJoin: (table: Table) => void;
}) {
  if (tables.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-semibold text-secondary">{title}</h3>
        <span className="text-xs text-muted">{hint}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {tables.map((table) => {
          const joinable = canJoin(table) && !hasActiveSession;
          const isCurrentTable = selectedTableId === table.id;
          const occupees = table.places_occupees ?? 0;
          const libres = placesLibres(table);

          return (
            <button
              key={table.id}
              type="button"
              disabled={!joinable && !isCurrentTable}
              onClick={() => {
                if (hasActiveSession) {
                  if (!isCurrentTable) onRequestJoin(table);
                  return;
                }
                if (joinable) onRequestJoin(table);
              }}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition",
                isCurrentTable &&
                  "border-primary bg-primary/10 ring-2 ring-primary/30",
                !isCurrentTable &&
                  !joinable &&
                  "cursor-not-allowed opacity-60",
                !isCurrentTable &&
                  joinable &&
                  "border-border bg-surface hover:border-primary/40",
                !isCurrentTable &&
                  !joinable &&
                  !hasActiveSession &&
                  "border-border bg-surface",
              )}
            >
              <Armchair
                size={24}
                className={
                  isCurrentTable
                    ? "text-primary"
                    : table.status === "LIBRE"
                      ? "text-success"
                      : table.status === "PARTIELLE"
                        ? "text-warning"
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
                {occupees}/{table.capacity} places
                {joinable && libres > 0 && ` · ${libres} libre(s)`}
              </span>
              <Badge tone={statusTone(isCurrentTable ? "LIBRE" : table.status)}>
                {isCurrentTable ? "Votre table" : labelTableStatus(table.status)}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
