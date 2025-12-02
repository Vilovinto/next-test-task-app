"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useGoogleLogin, useLogin, type LoginResponse } from "@/hooks/useAuth"
import { saveAuthToken } from "@/lib/auth"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { GoogleButton } from "@/components/auth/google-button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { user, loading } = useFirebaseUser()
  const { mutate: loginWithEmail, isPending, isError, error } = useLogin()
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

    loginWithEmail(
      { email, password },
      {
        onSuccess: handleAuthSuccess,
      },
    )
  }

  function handleGoogleSignIn() {
    loginWithGoogle(undefined, {
      onSuccess: handleAuthSuccess,
    })
  }

  const isDisabled = isPending || isGooglePending || !email || !password

  return (
    <AuthPageShell
      title="Sign in"
      description="Enter your credentials to access your tasks."
    >
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <label
            htmlFor="email"
            className="text-[16px] font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-4 text-[15px] shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="password"
            className="text-[16px] font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-4 text-[15px] shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {isError && (
          <p className="text-sm text-destructive">
            {error?.message || "Failed to sign in. Please try again."}
          </p>
        )}

        <Button
          type="submit"
          className="h-12 w-full text-[15px]"
          disabled={isDisabled}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>

        <GoogleButton
          label="Continue with Google"
          loadingLabel="Signing in with Google..."
          disabled={isGooglePending}
          onClick={handleGoogleSignIn}
        />

        <p className="text-center text-sm text-muted-foreground">
          Don{"'"}t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
      </AuthPageShell>
  )
}


