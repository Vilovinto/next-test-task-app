"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTask } from "@/hooks/useTasks"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"

export default function TaskDetailsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const { user, loading } = useFirebaseUser()
  const { data, isLoading, isError } = useTask(id)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-8">
      <header className="flex items-center gap-3">
        <Link href="/tasks">
          <Button variant="ghost" size="icon" aria-label="Back to tasks list">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Task details</p>
          <h1 className="text-xl font-semibold tracking-tight">
            {data?.title ?? "Task"}
          </h1>
        </div>
      </header>

      <main className="space-y-4 rounded-lg border bg-card p-6">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading task...</p>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            An error occurred while loading the task. Please check the API URL or network.
          </p>
        )}

        {!isLoading && !isError && !data && (
          <p className="text-sm text-muted-foreground">Task not found.</p>
        )}

        {data && (
          <>
            <section>
              <h2 className="mb-1 text-sm font-medium text-muted-foreground">Description</h2>
              <p className="text-sm">
                {data.description || "No description is provided for this task."}
              </p>
            </section>

            <section className="grid gap-4 text-sm sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground">Status</p>
                <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {data.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground">Priority</p>
                <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {data.priority}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-muted-foreground">Deadline</p>
                <span>
                  {data.dueDate
                    ? new Date(data.dueDate).toLocaleDateString()
                    : "Not specified"}
                </span>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}


