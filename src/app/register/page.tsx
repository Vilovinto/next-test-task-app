"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useGoogleLogin, useRegister, type LoginResponse } from "@/hooks/useAuth"
import { saveAuthToken } from "@/lib/auth"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { GoogleButton } from "@/components/auth/google-button"

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { user, loading } = useFirebaseUser()
  const { mutate: registerWithEmail, isPending, isError, error } = useRegister()
  const { mutate: loginWithGoogle, isPending: isGooglePending } = useGoogleLogin()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/tasks")
    }
  }, [user, loading, router])

  function handleAuthSuccess(data: LoginResponse) {
    saveAuthToken(data.token)
    router.push("/tasks")
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    registerWithEmail(
      { firstName, lastName, email, password, username },
      {
        onSuccess: handleAuthSuccess,
      },
    )
  }

  function handleGoogleSignUp() {
    loginWithGoogle(undefined, {
      onSuccess: handleAuthSuccess,
    })
  }

  const isDisabled =
    isPending ||
    isGooglePending ||
    !firstName ||
    !lastName ||
    !username ||
    !email ||
    !password

  return (
    <AuthPageShell
      title="Create account"
      description="Sign up to start managing your tasks."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="first-name"
            className="text-[14px] font-medium text-foreground"
          >
            First name
          </label>
          <input
            id="first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-4 text-[14px] shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="John"
            autoComplete="given-name"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="last-name"
            className="text-[14px] font-medium text-foreground"
          >
            Last name
          </label>
          <input
            id="last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-4 text-[14px] shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Doe"
            autoComplete="family-name"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-[14px] font-semibold leading-[18px] text-[#666666]"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-11 w-full rounded-md border border-[#CCCCCC] bg-white px-4 text-[14px] shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Choose a username"
            autoComplete="username"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[14px] font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-4 text-[14px] shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-[14px] font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-4 text-[14px] shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>

        {isError && (
          <p className="text-sm text-destructive">
            {error?.message || "Failed to create account. Please try again."}
          </p>
        )}

        <div className="mt-4 space-y-3">
          <Button
            type="submit"
            className="h-11 w-full text-[14px]"
            disabled={isDisabled}
          >
            {isPending ? "Creating account..." : "Sign up"}
          </Button>

          <GoogleButton
            label="Continue with Google"
            loadingLabel="Signing up with Google..."
            disabled={isGooglePending}
            onClick={handleGoogleSignUp}
          />

          <p className="pt-1 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </AuthPageShell>
  )
}

