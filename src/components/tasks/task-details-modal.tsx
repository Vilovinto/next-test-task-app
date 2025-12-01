"use client"

import { Button } from "@/components/ui/button"
import { useTask } from "@/hooks/useTasks"

type TaskDetailsModalProps = {
  open: boolean
  taskId: string | null
  titleOverride?: string
  descriptionOverride?: string
  dueDateOverride?: string
  priorityOverride?: "low" | "medium" | "high"
  statusOverride?: "todo" | "in_progress" | "review" | "completed"
  onClose: () => void
}

export function TaskDetailsModal({
  open,
  taskId,
  titleOverride,
  descriptionOverride,
  dueDateOverride,
  priorityOverride,
  statusOverride,
  onClose,
}: TaskDetailsModalProps) {
  const { data, isLoading, isError } = useTask(taskId ?? undefined)

  if (!open || !taskId) return null

  const title = titleOverride ?? data?.title ?? "Task"
  const description =
    descriptionOverride ??
    data?.description ??
    "No description is provided for this task."

  const deadline =
    dueDateOverride ?? data?.dueDate
      ? new Date(dueDateOverride ?? data?.dueDate ?? "").toLocaleDateString()
      : "Not specified"

  const priority = priorityOverride ?? data?.priority ?? "medium"

  const statusRaw = statusOverride ?? data?.status ?? "todo"

  const statusLabelMap: Record<string, string> = {
    todo: "To do",
    in_progress: "In progress",
    review: "Review",
    completed: "Completed",
  }

  const statusLabel = statusLabelMap[statusRaw] ?? statusRaw

  const priorityLabel =
    priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-[#AAAAAA]">Task details</p>
            <h2 className="mt-1 text-[18px] font-medium leading-[27px] text-[#121212]">
              {title}
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        {isLoading && !data && (
          <p className="text-sm text-[#888888]">Loading task...</p>
        )}

        {isError && (
          <p className="text-sm text-red-500">
            Failed to load task. Please try again.
          </p>
        )}

        {!isLoading && !isError && !data && !titleOverride && (
          <p className="text-sm text-[#888888]">Task not found.</p>
        )}

        {(data || titleOverride) && (
          <div className="space-y-4">
            <section>
              <h3 className="mb-1 text-sm font-medium text-[#666666]">
                Description
              </h3>
              <p className="text-sm text-[#121212]">{description}</p>
            </section>

            <section className="grid gap-4 text-sm sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Status</p>
                <span className="inline-flex rounded-full bg-[#F5F6FA] px-2 py-0.5 text-xs font-medium text-[#121212]">
                  {statusLabel}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Priority</p>
                <span className="inline-flex rounded-full bg-[#F5F6FA] px-2 py-0.5 text-xs font-medium text-[#121212]">
                  {priorityLabel}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Deadline</p>
                <span className="text-[#121212]">
                  {deadline}
                </span>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}


