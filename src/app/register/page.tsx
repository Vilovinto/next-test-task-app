"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useGoogleLogin, useRegister, type LoginResponse } from "@/hooks/useAuth"
import { saveAuthToken } from "@/lib/auth"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
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
      { firstName, lastName, email, password },
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
    isPending || isGooglePending || !firstName || !lastName || !email || !password

  return (
    <AuthPageShell
      title="Create account"
      description="Sign up to start managing your tasks."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label
            htmlFor="first-name"
            className="text-sm font-medium text-foreground"
          >
            First name
          </label>
          <input
            id="first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="John"
            autoComplete="given-name"
            required
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="last-name"
            className="text-sm font-medium text-foreground"
          >
            Last name
          </label>
          <input
            id="last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Doe"
            autoComplete="family-name"
            required
          />
        </div>

        <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

          <Button type="submit" className="w-full" disabled={isDisabled}>
            {isPending ? "Creating account..." : "Sign up"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isGooglePending}
            onClick={handleGoogleSignUp}
          >
            {isGooglePending ? "Signing up with Google..." : "Continue with Google"}
          </Button>
        </form>
      </AuthPageShell>
  )
}


