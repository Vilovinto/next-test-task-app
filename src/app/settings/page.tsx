"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { clearAuthToken } from "@/lib/auth"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { firebaseAuth, firebaseDb } from "@/lib/firebase"
import { Sidebar } from "@/components/layout/sidebar"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { Toast } from "@/components/ui/toast"
import { MobileNavigation } from "@/components/layout/mobile-navigation"
import { VerifyPasswordModal } from "@/components/settings/verify-password-modal"
import { NewPasswordModal } from "@/components/settings/new-password-modal"
import { ProfileForm } from "@/components/settings/profile-form"
import { ProfileSidebar } from "@/components/settings/profile-sidebar"

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
    if (!user || !user.uid) return

    async function loadProfileFromFirestore() {
      try {
        const userDocRef = doc(firebaseDb, "users", user!.uid)
        const snapshot = await getDoc(userDocRef)
        if (!snapshot.exists()) return

        const data = snapshot.data()
        const usernameFromDb =
          typeof data.username === "string" ? data.username : ""
        const profileImageFromDb =
          typeof data.profileImage === "string" ? data.profileImage : ""

        if (usernameFromDb) {
          setUsername(usernameFromDb)
          setSavedUsername(usernameFromDb)
        }

        if (profileImageFromDb) {
          setProfileImage(profileImageFromDb)
          setPreviewProfileImage(profileImageFromDb)
        }
      } catch (error) {
        console.error("Failed to load profile from Firestore", error)
      }
    }

    void loadProfileFromFirestore()
  }, [user])

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
    setProfileImage(previewProfileImage)

    if (user?.uid) {
      try {
        const payload: Record<string, string> = {}
        if (trimmedUsername) {
          payload.username = trimmedUsername
        } else {
          payload.username = ""
        }

        if (previewProfileImage) {
          payload.profileImage = previewProfileImage
        } else {
          payload.profileImage = ""
        }

        await setDoc(doc(firebaseDb, "users", user.uid), payload, {
          merge: true,
        })
      } catch (error) {
        console.error("Failed to save profile to Firestore", error)
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
    } catch {
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
    } catch {
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
      <Sidebar active="settings" />

      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activePage="settings"
        userInitial={authorInitial}
        displayName={displayName}
        email={email}
      />

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
          <ProfileForm
            firstNameDefault={firstNameDefault}
            lastNameDefault={lastNameDefault}
            username={username}
            email={email}
            previewProfileImage={previewProfileImage}
            savedUsername={savedUsername}
            nameInitials={nameInitials}
            isDirty={isDirty}
            onUsernameChange={setUsername}
            onProfileImageChange={handleProfileImageChange}
            onRemoveProfileImage={handleRemoveProfileImage}
            onSubmit={(event) => {
              event.preventDefault()
              if (!isDirty) return
              setIsSaveConfirmOpen(true)
            }}
            onChangePasswordClick={() => setIsChangePasswordConfirmOpen(true)}
          />
        </section>
      </main>

      <ProfileSidebar
        profileCompletion={profileCompletion}
        profileImage={profileImage}
        savedUsername={savedUsername}
        nameInitials={nameInitials}
        firstNameDefault={firstNameDefault}
        lastNameDefault={lastNameDefault}
        displayName={displayName}
        email={email}
        onLogout={handleLogout}
      />
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
      <VerifyPasswordModal
        open={isVerifyPasswordOpen}
        currentPassword={currentPassword}
        error={passwordModalError}
        isSubmitting={isPasswordSubmitting}
        onPasswordChange={setCurrentPassword}
        onCancel={() => {
          setIsVerifyPasswordOpen(false)
          setCurrentPassword("")
          setPasswordModalError("")
        }}
        onContinue={handleVerifyCurrentPassword}
      />
      <NewPasswordModal
        open={isNewPasswordOpen}
        newPassword={newPassword}
        confirmNewPassword={confirmNewPassword}
        error={passwordModalError}
        isSubmitting={isPasswordSubmitting}
        passwordsMatch={passwordsMatch}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmNewPassword}
        onCancel={() => {
          setIsNewPasswordOpen(false)
          setNewPassword("")
          setConfirmNewPassword("")
          setPasswordModalError("")
        }}
        onSave={handleChangePassword}
      />
      <Toast open={showSaveToast} message={saveToastMessage} />
    </div>
  )
}


