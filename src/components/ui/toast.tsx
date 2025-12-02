"use client"

type ToastProps = {
  open: boolean
  message: string
}

export function Toast({ open, message }: ToastProps) {
  if (!open) return null

  return (
    <div className="fixed right-4 top-4 z-50 rounded-md bg-[#121212] px-4 py-2 text-sm text-white shadow-lg">
      {message}
    </div>
  )
}


