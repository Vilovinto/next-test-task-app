"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { clearAuthToken } from "@/lib/auth"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { firebaseAuth, firebaseDb } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/sidebar"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { Toast } from "@/components/ui/toast"
import { DashboardIcon } from "@/components/icons/dashboard-icon"
import { SettingsIcon } from "@/components/icons/settings-icon"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useFirebaseUser()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(
    null,
  )
  const [username, setUsername] = useState("")
  const [savedUsername, setSavedUsername] = useState("")
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [saveToastMessage, setSaveToastMessage] = useState(
    "Profile changes have been saved successfully",
  )
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false)
  const [isChangePasswordConfirmOpen, setIsChangePasswordConfirmOpen] =
    useState(false)
  const [isVerifyPasswordOpen, setIsVerifyPasswordOpen] = useState(false)
  const [isNewPasswordOpen, setIsNewPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordModalError, setPasswordModalError] = useState("")
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedImage = window.localStorage.getItem("profile_image_data_url")
    if (storedImage) {
      setProfileImage(storedImage)
      setPreviewProfileImage(storedImage)
    }
    const storedUsername = window.localStorage.getItem("profile_username") ?? ""
    setUsername(storedUsername)
    setSavedUsername(storedUsername)
  }, [])

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

  const [firstNameDefault, lastNameDefault] = (displayName ?? "")
    .trim()
    .split(/\s+/, 2)

  const nameInitials =
    (firstNameDefault && lastNameDefault
      ? `${firstNameDefault[0]}${lastNameDefault[0]}`
      : displayName
          ?.trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join("")) || authorInitial

  const totalProfileFields = 5
  const filledProfileFields =
    (firstNameDefault ? 1 : 0) +
    (lastNameDefault ? 1 : 0) +
    (savedUsername.trim() ? 1 : 0) +
    (email ? 1 : 0) +
    (profileImage ? 1 : 0)

  const isDirty =
    username.trim() !== savedUsername.trim() ||
    previewProfileImage !== profileImage

  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmNewPassword

  async function handleSave(event?: React.FormEvent<HTMLFormElement>) {
    if (event) {
      event.preventDefault()
    }
    const trimmedUsername = username.trim()
    const changedFields: string[] = []

    if (trimmedUsername !== savedUsername.trim()) {
      changedFields.push("Username")
    }

    if (previewProfileImage !== profileImage) {
      changedFields.push("Profile photo")
    }

    setSavedUsername(trimmedUsername)

    if (typeof window !== "undefined") {
      if (trimmedUsername) {
        window.localStorage.setItem("profile_username", trimmedUsername)
      } else {
        window.localStorage.removeItem("profile_username")
      }

      if (previewProfileImage) {
        setProfileImage(previewProfileImage)
        window.localStorage.setItem("profile_image_data_url", previewProfileImage)
      } else {
        setProfileImage(null)
        window.localStorage.removeItem("profile_image_data_url")
      }
    }

    // Persist username to Firestore so we can log in with it
    if (user?.uid && trimmedUsername) {
      try {
        await setDoc(
          doc(firebaseDb, "users", user.uid),
          { username: trimmedUsername },
          { merge: true },
        )
      } catch (error) {
        console.error("Failed to save username to Firestore", error)
      }
    }

    if (changedFields.length === 1) {
      setSaveToastMessage(
        `${changedFields[0]} changes have been saved successfully`,
      )
    } else if (changedFields.length > 1) {
      setSaveToastMessage("Profile changes have been saved successfully")
    }

    setShowSaveToast(true)
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setShowSaveToast(false)
      }, 2500)
    }
  }
  const profileCompletion = Math.round(
    (filledProfileFields / totalProfileFields) * 100,
  )

  async function handleVerifyCurrentPassword() {
    if (!user?.email || !currentPassword || !firebaseAuth.currentUser) return
    setIsPasswordSubmitting(true)
    setPasswordModalError("")
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      )
      await reauthenticateWithCredential(firebaseAuth.currentUser, credential)
      setIsVerifyPasswordOpen(false)
      setCurrentPassword("")
      setPasswordModalError("")
      setIsNewPasswordOpen(true)
    } catch (error) {
      setPasswordModalError("Incorrect current password. Please try again.")
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  async function handleChangePassword() {
    if (!passwordsMatch || !firebaseAuth.currentUser) return
    setIsPasswordSubmitting(true)
    setPasswordModalError("")
    try {
      await updatePassword(firebaseAuth.currentUser, newPassword)
      setIsNewPasswordOpen(false)
      setNewPassword("")
      setConfirmNewPassword("")
      setSaveToastMessage("Password changes have been saved successfully")
      setShowSaveToast(true)
      window.setTimeout(() => {
        setShowSaveToast(false)
      }, 2500)
    } catch (error) {
      setPasswordModalError("Failed to change password. Please try again.")
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  function handleProfileImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      if (result) {
        setPreviewProfileImage(result)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveProfileImage() {
    setPreviewProfileImage(null)
  }

  async function handleLogout() {
    await signOut(firebaseAuth)
    clearAuthToken()
    router.push("/login")
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
        userName={displayName || ""}
        userEmail={email ?? ""}
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
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-medium leading-[30px] text-[#121212]">
              Settings
            </h1>
            <p className="mt-1 text-[14px] font-normal leading-[21px]">
              <span className="text-[#64C882]">{weekday}, </span>
              <span className="text-[#AAAAAA]">
                {month} {day} {year}
              </span>
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
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (!isDirty) return
              setIsSaveConfirmOpen(true)
            }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
                  First name
                </label>
                <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
                  <input
                    type="text"
                    placeholder="First name"
                    className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#000000] outline-none"
                    defaultValue={firstNameDefault ?? ""}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
                  Last name
                </label>
                <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
                  <input
                    type="text"
                    placeholder="Last name"
                    className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#000000] outline-none"
                    defaultValue={lastNameDefault ?? ""}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
                Username
              </label>
              <div className="flex h-14 w-full items-center rounded-lg border border-[#CCCCCC] bg-white px-4">
                <input
                  type="text"
                  placeholder="username"
                  className="h-full w-full border-none bg-transparent text-[16px] leading-[24px] text-[#000000] outline-none"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold leading-[18px] text-[#666666]">
                Profile photo
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#C4C4C4]">
                  {previewProfileImage ? (
                    <img
                      src={previewProfileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-medium text-white">
                      {(savedUsername.trim() || nameInitials)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-md border border-[#CCCCCC] bg-white px-3 py-2 text-xs font-medium text-[#121212]">
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px]"
                    disabled={!previewProfileImage}
                    onClick={handleRemoveProfileImage}
                  >
                    Remove
                  </Button>
                </div>
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
                  defaultValue={email ?? ""}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-[35px] rounded-md px-4 text-[12px] font-bold leading-[18px]"
                onClick={() => setIsChangePasswordConfirmOpen(true)}
              >
                Change password
              </Button>
              <Button
                type="submit"
                className="h-[35px] w-[272px] rounded-md bg-[#64C882] text-[12px] font-bold leading-[18px] text-white hover:bg-[#52b66c] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isDirty}
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
          <p className="mt-1 text-[14px] leading-[21px] text-[#64C882]">
            {profileCompletion}% completed
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="relative h-[100px] w-[100px]">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#64C882 ${profileCompletion}%, #F5F6FA ${profileCompletion}% 100%)`,
              }}
            />
            <div className="absolute inset-[4px] rounded-full bg-white" />
            <div className="absolute inset-[10px] overflow-hidden rounded-full bg-[#C4C4C4]">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[24px] font-medium text-white">
                  {(savedUsername.trim() || nameInitials)[0]?.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[16px] font-medium leading-[24px] text-[#121212]">
              {(firstNameDefault || lastNameDefault
                ? `${firstNameDefault ?? ""} ${lastNameDefault ?? ""}`.trim()
                : displayName) || "User"}
            </p>
            {savedUsername.trim() && (
              <p className="mt-1 text-[14px] leading-[21px] text-[#64C882]">
                @{savedUsername.trim()}
              </p>
            )}
            {email && (
              <p className="mt-1 text-[14px] leading-[21px] text-[#AAAAAA]">
                {email}
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
      <ConfirmModal
        open={isChangePasswordConfirmOpen}
        title="Change password"
        description="Do you want to change your account password?"
        confirmLabel="Continue"
        cancelLabel="Cancel"
        variant="default"
        onCancel={() => setIsChangePasswordConfirmOpen(false)}
        onConfirm={() => {
          setIsChangePasswordConfirmOpen(false)
          setIsVerifyPasswordOpen(true)
          setCurrentPassword("")
          setPasswordModalError("")
        }}
      />
      <ConfirmModal
        open={isSaveConfirmOpen}
        title="Save profile changes"
        description="Do you want to apply these profile changes?"
        confirmLabel="Save"
        cancelLabel="Cancel"
        variant="default"
        onCancel={() => setIsSaveConfirmOpen(false)}
        onConfirm={async () => {
          await handleSave()
          setIsSaveConfirmOpen(false)
        }}
      />
      {isVerifyPasswordOpen && (
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
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="h-10 w-full rounded-md border border-[#CCCCCC] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#64C882]"
                placeholder="Current password"
              />
              {passwordModalError && (
                <p className="text-xs text-red-500">{passwordModalError}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsVerifyPasswordOpen(false)
                  setCurrentPassword("")
                  setPasswordModalError("")
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!currentPassword || isPasswordSubmitting}
                className="bg-[#64C882] text-white hover:bg-[#52b66c] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleVerifyCurrentPassword}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
      {isNewPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-[#121212]">
              Set new password
            </h2>
            <p className="mt-2 text-sm text-[#666666]">
              Enter a new password and confirm it.
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-10 w-full rounded-md border border-[#CCCCCC] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#64C882]"
                placeholder="New password"
              />
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(event) =>
                  setConfirmNewPassword(event.target.value)
                }
                className="h-10 w-full rounded-md border border-[#CCCCCC] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#64C882]"
                placeholder="Confirm new password"
              />
              {passwordModalError && (
                <p className="text-xs text-red-500">{passwordModalError}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsNewPasswordOpen(false)
                  setNewPassword("")
                  setConfirmNewPassword("")
                  setPasswordModalError("")
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!passwordsMatch || isPasswordSubmitting}
                className="bg-[#64C882] text-white hover:bg-[#52b66c] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleChangePassword}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      <Toast open={showSaveToast} message={saveToastMessage} />
    </div>
  )
}


