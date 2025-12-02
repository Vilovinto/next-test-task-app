"use client"

import { Button } from "@/components/ui/button"
import { useTask } from "@/hooks/useTasks"

type TaskDetailsModalProps = {
  open: boolean
  taskId: string | null
  titleOverride?: string
  descriptionOverride?: string
  dueDateOverride?: string
  closedAtOverride?: string
  priorityOverride?: "low" | "medium" | "high"
  statusOverride?: "todo" | "in_progress" | "review" | "completed"
  createdByOverride?: string
  assigneeOverride?: string
  assigneesOverride?: string[]
  reviewerOverride?: string
  onClose: () => void
}

export function TaskDetailsModal({
  open,
  taskId,
  titleOverride,
  descriptionOverride,
  dueDateOverride,
  closedAtOverride,
  priorityOverride,
  statusOverride,
  createdByOverride,
  assigneeOverride,
  assigneesOverride,
  reviewerOverride,
  onClose,
}: TaskDetailsModalProps) {
  const { data, isLoading, isError } = useTask(taskId ?? undefined)

  if (!open || !taskId) return null

  const title = titleOverride ?? data?.title ?? "Task"
  const description =
    descriptionOverride ??
    data?.description ??
    "No description is provided for this task."

  const rawDeadline = dueDateOverride ?? data?.dueDate ?? ""
  let deadline = "Not specified"
  let isDeadlineOverdue = false
  let deadlineDate: Date | null = null
  if (rawDeadline) {
    const date = new Date(rawDeadline)
    if (!Number.isNaN(date.getTime())) {
      deadlineDate = date
      deadline = date.toLocaleDateString()

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(date)
      due.setHours(0, 0, 0, 0)
      isDeadlineOverdue = due < today
    }
  }

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

  const createdByLabel =
    createdByOverride ?? (data as { createdByName?: string })?.createdByName ?? "Not specified"
  const assigneeLabel =
    assigneeOverride ?? (data as { assigneeName?: string })?.assigneeName ?? "Not specified"

  const reviewerLabel =
    reviewerOverride ?? (data as { reviewerName?: string })?.reviewerName ?? "Not specified"

  const createdByInitial = createdByLabel
    .trim()
    .charAt(0)
    .toUpperCase()
  const assigneeInitial = assigneeLabel
    .trim()
    .charAt(0)
    .toUpperCase()

  const reviewerInitial = reviewerLabel
    .trim()
    .charAt(0)
    .toUpperCase()

  const hasReviewer = reviewerLabel !== "Not specified"
  const isApproved = hasReviewer && statusRaw === "completed"

  const assigneeList: string[] =
    assigneesOverride && assigneesOverride.length > 0
      ? assigneesOverride
      : assigneeLabel !== "Not specified"
        ? [assigneeLabel]
        : []

  const rawClosedAt = closedAtOverride ?? (data as { closedAt?: string })?.closedAt ?? ""
  let closedAtLabel = ""
  let closedDate: Date | null = null
  if (rawClosedAt) {
    const parsed = new Date(rawClosedAt)
    if (!Number.isNaN(parsed.getTime())) {
      closedDate = parsed
      closedAtLabel = parsed.toLocaleDateString()
    }
  }

  const statusBgClass =
    statusRaw === "todo"
      ? "bg-[#F5F6FA] text-[#121212]"
      : statusRaw === "in_progress"
        ? "bg-[#FFF3E0] text-[#C97A16]"
        : statusRaw === "review"
          ? "bg-[#E4ECFF] text-[#4B7BF5]"
          : "bg-[#E5F7EB] text-[#2F8F4E]"

  const priorityBgClass =
    priority === "low"
      ? "bg-[#E5F7EB] text-[#2F8F4E]"
      : priority === "medium"
        ? "bg-[#FFF3E0] text-[#C97A16]"
        : "bg-[#FDECEC] text-[#D23D3D]"

  const deadlineTextClass =
    statusRaw === "completed"
      ? "text-[#AAAAAA]"
      : rawDeadline
        ? isDeadlineOverdue
          ? "text-[#D23D3D]"
          : "text-[#64C882]"
        : "text-[#121212]"

  let closedTextClass = "text-[#AAAAAA]"
  if (statusRaw === "completed" && closedDate && deadlineDate) {
    const closedMid = new Date(closedDate)
    closedMid.setHours(0, 0, 0, 0)
    const dueMid = new Date(deadlineDate)
    dueMid.setHours(0, 0, 0, 0)
    closedTextClass =
      closedMid > dueMid ? "text-[#D23D3D]" : "text-[#64C882]"
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg">
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

        {isLoading &&
          !data &&
          !titleOverride &&
          !descriptionOverride &&
          !dueDateOverride && (
            <div className="mb-4 h-2 w-32 animate-pulse rounded-full bg-[#F5F6FA]" />
          )}

        {isError && !titleOverride && !descriptionOverride && !dueDateOverride && (
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

            <section className="grid gap-4 text-sm sm:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Status</p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBgClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Priority</p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${priorityBgClass}`}
                >
                  {priorityLabel}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Deadline</p>
                <span className={deadlineTextClass}>{deadline}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Closed</p>
                <span className={closedTextClass}>
                  {closedAtLabel || "—"}
                </span>
              </div>
            </section>

            <section className={`mt-2 grid gap-4 text-sm ${hasReviewer ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Created by</p>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C4C4C4] text-xs font-medium text-white">
                    {createdByInitial}
                  </span>
                  <span className="text-[#121212]">{createdByLabel}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-[#AAAAAA]">Assigned to</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C4C4C4] text-xs font-medium text-white">
                      {assigneeInitial}
                    </span>
                    <span className="text-[#121212]">{assigneeLabel}</span>
                  </div>
                  {assigneeList.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C4C4C4] text-xs font-medium text-white">
                        {assigneeList[1].trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="text-[#121212]">
                        {assigneeList[1]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {hasReviewer && (
                <div className="space-y-1">
                  <p className="text-xs uppercase text-[#AAAAAA]">Reviewer</p>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C4C4C4] text-xs font-medium text-white">
                      {reviewerInitial}
                    </span>
                    <span className="flex items-center gap-1">
                      {isApproved && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2F8F4E] text-[9px] font-bold text-white">
                          ✓
                        </span>
                      )}
                      <span className="text-[#121212]">{reviewerLabel}</span>
                    </span>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}


