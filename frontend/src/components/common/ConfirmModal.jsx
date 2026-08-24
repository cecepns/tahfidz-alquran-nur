import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Trash2 } from "lucide-react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  confirmText = "Hapus",
  cancelText = "Batal",
  loading = false,
  variant = "danger",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={!loading}>
      <div className="text-center sm:text-left sm:flex sm:items-start gap-4">
        <div className="mx-auto sm:mx-0 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 text-rose-600 sm:h-10 sm:w-10">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="mt-3 sm:mt-0 text-center sm:text-left">
          <h4 className="text-base font-bold text-slate-800">{title}</h4>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          loading={loading}
          icon={variant === "danger" ? Trash2 : null}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
