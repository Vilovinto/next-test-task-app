"use client"

import { Button } from "@/components/ui/button"

type NewPasswordModalProps = {
  open: boolean
  newPassword: string
  confirmNewPassword: string
  error: string
  isSubmitting: boolean
  passwordsMatch: boolean
  onNewPasswordChange: (password: string) => void
  onConfirmPasswordChange: (password: string) => void
  onCancel: () => void
  onSave: () => void
}

export function NewPasswordModal({
  open,
  newPassword,
  confirmNewPassword,
  error,
  isSubmitting,
  passwordsMatch,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onCancel,
  onSave,
}: NewPasswordModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#121212]">Set new password</h2>
        <p className="mt-2 text-sm text-[#666666]">
          Enter a new password and confirm it.
        </p>
        <div className="mt-4 space-y-3">
          <input
            type="password"
            value={newPassword}
            onChange={(event) => onNewPasswordChange(event.target.value)}
            className="h-10 w-full rounded-md border border-[#CCCCCC] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#64C882]"
            placeholder="New password"
          />
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            className="h-10 w-full rounded-md border border-[#CCCCCC] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#64C882]"
            placeholder="Confirm new password"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!passwordsMatch || isSubmitting}
            className="bg-[#64C882] text-white hover:bg-[#52b66c] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

