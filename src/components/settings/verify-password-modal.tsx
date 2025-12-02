"use client"

import { Button } from "@/components/ui/button"

type VerifyPasswordModalProps = {
  open: boolean
  currentPassword: string
  error: string
  isSubmitting: boolean
  onPasswordChange: (password: string) => void
  onCancel: () => void
  onContinue: () => void
}

export function VerifyPasswordModal({
  open,
  currentPassword,
  error,
  isSubmitting,
  onPasswordChange,
  onCancel,
  onContinue,
}: VerifyPasswordModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#121212]">
          Confirm current password
        </h2>
        <p className="mt-2 text-sm text-[#666666]">
          Enter your current password to continue.
        </p>
        <div className="mt-4 space-y-2">
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => onPasswordChange(event.target.value)}
            className="h-10 w-full rounded-md border border-[#CCCCCC] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#64C882]"
            placeholder="Current password"
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
            disabled={!currentPassword || isSubmitting}
            className="bg-[#64C882] text-white hover:bg-[#52b66c] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

