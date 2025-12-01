"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

export type AssigneeOption = {
  id: string
  name: string
}

export type NewTaskFormValues = {
  title: string
  description: string
  dueDate: string
  assigneeId: string
}

type NewTaskModalProps = {
  open: boolean
  assignees: AssigneeOption[]
  onClose: () => void
  onSubmit: (values: NewTaskFormValues) => void
}

export function NewTaskModal({
  open,
  assignees,
  onClose,
  onSubmit,
}: NewTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>("")

  if (!open) return null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const payload: NewTaskFormValues = {
      title: trimmedTitle,
      description,
      dueDate,
      assigneeId: assigneeId || assignees[0]?.id || "",
    }

    onSubmit(payload)
    setTitle("")
    setDescription("")
    setDueDate("")
    setAssigneeId("")
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[#121212]">New task</h2>
        <p className="mt-1 mb-4 text-sm text-[#888888]">
          Fill in the details for your new task.
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
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
            <div className="space-y-1">
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
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


