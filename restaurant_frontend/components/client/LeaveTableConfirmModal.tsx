"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface LeaveTableConfirmModalProps {
  open: boolean;
  tableNumero: number;
  leaving?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LeaveTableConfirmModal({
  open,
  tableNumero,
  leaving,
  onClose,
  onConfirm,
}: LeaveTableConfirmModalProps) {
  return (
    <Modal open={open} title="Quitter la table ?" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-background p-3">
          <LogOut size={20} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-sm text-muted">
            Voulez-vous vraiment quitter la table{" "}
            <span className="font-semibold text-secondary">{tableNumero}</span> ?
            Vous ne pourrez plus commander tant que vous ne vous y serez pas
            reconnecté.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={leaving}>
            Annuler
          </Button>
          <Button type="button" onClick={onConfirm} disabled={leaving}>
            {leaving ? "Déconnexion..." : "Oui, quitter la table"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
