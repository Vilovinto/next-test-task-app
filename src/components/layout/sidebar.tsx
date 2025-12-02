"use client"

import Link from "next/link"

import { DashboardIcon } from "@/components/icons/dashboard-icon"
import { SettingsIcon } from "@/components/icons/settings-icon"

type SidebarProps = {
  active: "tasks" | "settings"
}

export function Sidebar({ active }: SidebarProps) {

  const dashboardColor =
    active === "tasks" ? "text-[#64C882]" : "text-[#AAAAAA]"
  const settingsColor =
    active === "settings" ? "text-[#64C882]" : "text-[#AAAAAA]"

  return (
    <aside className="hidden h-full w-[220px] flex-col justify-between border-r bg-white px-7 py-10 md:flex">
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF9F24] text-sm font-medium text-white">
            C
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#121212]">
            TESTAPP
          </span>
        </div>

        <nav className="space-y-4 text-sm">
          <Link
            href="/tasks"
            className={`flex items-center gap-3 ${dashboardColor}`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <DashboardIcon />
            </span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-3 ${settingsColor}`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <SettingsIcon />
            </span>
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}


