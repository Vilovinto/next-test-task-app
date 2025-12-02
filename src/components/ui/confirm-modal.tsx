"use client"

import { Button } from "@/components/ui/button"

type ConfirmModalProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: "default" | "destructive"
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "destructive",
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#121212]">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-[#666666]">{description}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            className={
              variant === "destructive"
                ? "bg-[#D23D3D] text-white hover:bg-[#b63030]"
                : "bg-[#64C882] text-white hover:bg-[#52b66c]"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}


