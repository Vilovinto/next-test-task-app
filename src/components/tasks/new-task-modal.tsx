"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export type AssigneeOption = {
  id: string
  name: string
}

export type PriorityValue = "low" | "medium" | "high"

export type NewTaskFormValues = {
  title: string
  description: string
  dueDate: string
  assigneeId: string
  priority: PriorityValue
}

type NewTaskModalProps = {
  open: boolean
  assignees: AssigneeOption[]
  onClose: () => void
  onSubmit: (values: NewTaskFormValues) => void
  initialValues?: Partial<NewTaskFormValues>
  mode?: "create" | "edit"
}

export function NewTaskModal({
  open,
  assignees,
  onClose,
  onSubmit,
  initialValues,
  mode = "create",
}: NewTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [priority, setPriority] = useState<PriorityValue | "">("")

  useEffect(() => {
    if (!open) {
      setTitle("")
      setDescription("")
      setDueDate("")
      setAssigneeId("")
      setPriority("")
      return
    }

    if (mode === "edit" && initialValues) {
      const {
        title: initialTitle = "",
        description: initialDescription = "",
        dueDate: initialDueDate = "",
        assigneeId: initialAssigneeId = "",
        priority: initialPriority = "",
      } = initialValues

      setTitle(initialTitle)
      setDescription(initialDescription)
      setDueDate(initialDueDate)
      setAssigneeId(initialAssigneeId)
      setPriority(initialPriority || "")
      return
    }

    if (mode === "create") {
      setTitle("")
      setDescription("")
      setDueDate("")
      setAssigneeId("")
      setPriority("")
    }
  }, [open, mode, initialValues])

  if (!open) return null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const resolvedPriority: PriorityValue =
      (priority || initialValues?.priority || "medium") as PriorityValue

    const payload: NewTaskFormValues = {
      title: trimmedTitle,
      description,
      dueDate,
      assigneeId: assigneeId || assignees[0]?.id || "",
      priority: resolvedPriority,
    }

    onSubmit(payload)
    setTitle("")
    setDescription("")
    setDueDate("")
    setAssigneeId("")
    setPriority("")
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#121212]">
          {mode === "edit" ? "Edit task" : "New task"}
        </h2>
        <p className="mt-1 mb-4 text-sm text-[#888888]">
          {mode === "edit"
            ? "Update the details for this task."
            : "Fill in the details for your new task."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="new-task-title"
              className="text-sm font-medium text-[#121212]"
            >
              Title
            </label>
            <input
              id="new-task-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Type task title..."
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="new-task-description"
              className="text-sm font-medium text-[#121212]"
            >
              Description
            </label>
            <textarea
              id="new-task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1 md:col-span-1">
              <label
                htmlFor="new-task-due-date"
                className="text-sm font-medium text-[#121212]"
              >
                Due date
              </label>
              <input
                id="new-task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label
                htmlFor="new-task-priority"
                className="text-sm font-medium text-[#121212]"
              >
                Priority
              </label>
              <select
                id="new-task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    (event.target.value || "") as PriorityValue | "",
                  )
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-1">
              <label
                htmlFor="new-task-assignee"
                className="text-sm font-medium text-[#121212]"
              >
                Assignee
              </label>
              <select
                id="new-task-assignee"
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select contact</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim()}>
              {mode === "edit" ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


