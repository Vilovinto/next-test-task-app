"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useLogin } from "@/hooks/useAuth"
import { saveAuthToken } from "@/lib/auth"
import { AuthPageShell } from "@/components/auth/auth-page-shell"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { mutate, isPending, isError, error } = useLogin()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    mutate(
      { email, password },
      {
        onSuccess: (data) => {
          saveAuthToken(data.token)
          router.push("/tasks")
        },
      },
    )
  }

  const isDisabled = isPending || !email || !password

  return (
    <AuthPageShell
      title="Sign in"
      description="Enter your credentials to access your tasks."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              required
            />
          </div>

          {isError && (
            <p className="text-sm text-destructive">
              {error?.message || "Failed to sign in. Please try again."}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isDisabled}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </AuthPageShell>
  )
}


