import type { ReactNode } from "react"

interface AuthPageShellProps {
  title: string
  description: string
  children: ReactNode
}

export function AuthPageShell({ title, description, children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FD] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#F0F0F0] bg-white px-8 py-10 shadow-sm">
        <div className="mb-8 text-left">
          <h1 className="text-[20px] font-medium leading-[30px] text-[#121212]">
            {title}
          </h1>
          <p className="mt-1 text-[14px] leading-[21px] text-[#888888]">
            {description}
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}


