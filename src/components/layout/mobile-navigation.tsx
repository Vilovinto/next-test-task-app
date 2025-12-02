"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { DashboardIcon } from "@/components/icons/dashboard-icon"
import { SettingsIcon } from "@/components/icons/settings-icon"

type MobileNavigationProps = {
  isOpen: boolean
  onClose: () => void
  activePage: "tasks" | "settings"
  userInitial: string
  displayName?: string | null
  email?: string | null
}

export function MobileNavigation({
  isOpen,
  onClose,
  activePage,
  userInitial,
  displayName,
  email,
}: MobileNavigationProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-30 flex bg-white transition-transform duration-200 ease-out md:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
      )}
    >
      <div className="flex w-full flex-col justify-between border-r bg-white px-7 py-10">
        <div className="space-y-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF9F24] text-sm font-medium text-white">
                C
              </div>
              <span className="text-lg font-semibold tracking-tight text-[#121212]">
                TESTAPP
              </span>
            </div>
            <button
              type="button"
              className="rounded-md border px-2 py-1 text-xs text-[#121212]"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <nav className="space-y-4 text-sm">
            <Link
              href="/tasks"
              className={cn(
                "flex items-center gap-3",
                activePage === "tasks" ? "text-[#64C882]" : "text-[#AAAAAA]",
              )}
              onClick={onClose}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center">
                <DashboardIcon />
              </span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3",
                activePage === "settings" ? "text-[#64C882]" : "text-[#AAAAAA]",
              )}
              onClick={onClose}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center">
                <SettingsIcon />
              </span>
              <span>Setting</span>
            </Link>
          </nav>
        </div>

        <div className="relative mt-8">
          <button
            type="button"
            className="flex items-center gap-3 rounded-md px-1 py-1.5 text-left hover:bg-[#F7F9FD]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C4C4C4] text-xs font-medium text-white">
              {userInitial}
            </span>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-[#000000]">
                {displayName || "User R."}
              </p>
              <p className="text-[10px] text-[#AAAAAA]">{email}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

