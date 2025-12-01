"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"

import { useTasks } from "@/hooks/useTasks"
import { Button } from "@/components/ui/button"
import { clearAuthToken } from "@/lib/auth"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { firebaseAuth } from "@/lib/firebase"

export default function TasksPage() {
  const router = useRouter()
  const { user, loading } = useFirebaseUser()
  const { data, isLoading, isError, refetch } = useTasks()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  async function handleLogout() {
    await signOut(firebaseAuth)
    clearAuthToken()
    router.push("/login")
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Basic tasks list loaded via TanStack Query from the API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="rounded-lg border bg-card">
        {isLoading && (
          <div className="p-6 text-sm text-muted-foreground">Loading tasks...</div>
        )}

        {isError && (
          <div className="p-6 text-sm text-destructive">
            An error occurred while loading tasks. Please check the API URL or network.
          </div>
        )}

        {!isLoading && !isError && (!data || data.length === 0) && (
          <div className="p-6 text-sm text-muted-foreground">No tasks yet.</div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <ul className="divide-y">
            {data.map((task) => (
              <li key={task.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {task.description ?? "No description"}
                  </p>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2 text-xs">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                    {task.status}
                  </span>
                  <Link href={`/tasks/${task.id}`}>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}


