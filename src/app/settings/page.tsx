"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { clearAuthToken } from "@/lib/auth"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { firebaseAuth } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardIcon } from "@/components/icons/dashboard-icon"
import { SettingsIcon } from "@/components/icons/settings-icon"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useFirebaseUser()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return null
  }

  const { displayName, email } = user
  const authorInitial = (displayName || email || "U").trim().charAt(0).toUpperCase()

  async function handleLogout() {
    await signOut(firebaseAuth)
    clearAuthToken()
    router.push("/login")
  }

  function handleToggleUserMenu() {
    setIsUserMenuOpen((prev) => !prev)
  }

  const today = new Date()
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" })
  const day = today.toLocaleDateString("en-US", { day: "numeric" })
  const month = today.toLocaleDateString("en-US", { month: "long" })
  const year = today.getFullYear()

  return (
    <div className="flex h-screen bg-[#F7F9FD] overflow-hidden">
      <Sidebar
        active="settings"
        authorInitial={authorInitial}
        userName={user.displayName || "User R."}
        userEmail={user.email ?? ""}
        isUserMenuOpen={isUserMenuOpen}
        onToggleUserMenu={handleToggleUserMenu}
        onLogout={handleLogout}
      />

      <div
        className={cn(
          "fixed inset-0 z-30 flex bg-white transition-transform duration-200 ease-out md:hidden",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
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
                onClick={() => setIsMobileNavOpen(false)}
              >
                Close
              </button>
            </div>

            <nav className="space-y-4 text-sm">
              <Link
                href="/tasks"
                className="flex items-center gap-3 text-[#AAAAAA]"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center">
                  <DashboardIcon />
                </span>
                <span>Dashboard</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 text-[#64C882]"
                onClick={() => setIsMobileNavOpen(false)}
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
              onClick={handleToggleUserMenu}
              className="flex w-full items-center gap-3 rounded-md px-1 py-1.5 text-left hover:bg-[#F7F9FD]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C4C4C4] text-xs font-medium text-white">
                {authorInitial}
              </span>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-[#000000]">
                  {user.displayName || "User R."}
                </p>
                <p className="text-[10px] text-[#AAAAAA]">{user.email}</p>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute bottom-11 left-0 z-20 w-40 rounded-md border bg-white py-1 text-xs shadow-md">
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-2 text-left hover:bg-[#F7F9FD]"
                  onClick={async () => {
                    setIsUserMenuOpen(false)
                    await handleLogout()
                    setIsMobileNavOpen(false)
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-medium leading-[30px] text-[#121212]">
              Settings
            </h1>
            <p className="mt-1 text-[14px] font-normal leading-[21px] text-[#64C882]">
              {weekday}, {day} {month} {year}
            </p>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMobileNavOpen(true)}
            >
              Menu
            </Button>
          </div>
        </header>

        <section className="w-full space-y-6 pr-0 lg:pr-8">
          <form className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
                Username
              </label>
              <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
                <input
                  type="text"
                  placeholder="Type here"
                  className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#000000] outline-none"
                  defaultValue={user.displayName ?? ""}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
                Email
              </label>
              <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
                <input
                  type="email"
                  placeholder="Type here"
                  className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#666666] outline-none"
                  defaultValue={user.email ?? ""}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                className="h-[35px] w-[272px] rounded-md bg-[#64C882] text-[12px] font-bold leading-[18px] text-white hover:bg-[#52b66c]"
              >
                Save
              </Button>
            </div>
          </form>
        </section>
      </main>

      <aside className="hidden h-full w-[312px] flex-col border-l border-[#F5F6FA] bg-white px-6 py-8 shadow-sm lg:flex">
        <div>
          <h2 className="text-[20px] font-medium leading-[30px] text-[#121212]">
            My Profile
          </h2>
          {user.email && (
            <p className="mt-1 text-[14px] leading-[21px] text-[#64C882]">
              {user.email}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="relative h-[100px] w-[100px]">
            <div className="absolute inset-[10px] rounded-full bg-[#C4C4C4]" />
            <div className="absolute inset-0 rounded-full border-[3px] border-[#64C882]" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-[16px] font-medium leading-[24px] text-[#121212]">
              {user.displayName || "User"}
            </p>
            {user.email && (
              <p className="mt-1 text-[14px] leading-[21px] text-[#AAAAAA]">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-[#F5F6FA]" />

        <div className="mt-auto flex flex-col gap-4">
          <Button
            type="button"
            className="h-[35px] w-full rounded-md bg-[#D23D3D] text-[12px] font-bold leading-[18px] text-white hover:bg-[#b63030]"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>
    </div>
  )
}


