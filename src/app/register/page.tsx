"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useRegister } from "@/hooks/useAuth"
import { saveAuthToken } from "@/lib/auth"
import { AuthPageShell } from "@/components/auth/auth-page-shell"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { mutate, isPending, isError, error } = useRegister()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    mutate(
      { name: name || undefined, email, password },
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
      title="Create account"
      description="Sign up to start managing your tasks."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="John Doe"
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
        </form>
      </AuthPageShell>
  )
}


