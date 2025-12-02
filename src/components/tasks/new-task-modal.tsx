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
  assigneeIds?: string[]
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
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [priority, setPriority] = useState<PriorityValue | "">("")

  useEffect(() => {
    if (!open) {
      setTitle("")
      setDescription("")
      setDueDate("")
      setAssigneeIds([])
      setPriority("")
      return
    }

    if (mode === "edit" && initialValues) {
      const {
        title: initialTitle = "",
        description: initialDescription = "",
        dueDate: initialDueDate = "",
        assigneeId: initialAssigneeId = "",
        assigneeIds: initialAssigneeIds = [],
        priority: initialPriority = "",
      } = initialValues

      const baseAssignees =
        initialAssigneeIds && initialAssigneeIds.length > 0
          ? initialAssigneeIds
          : initialAssigneeId
            ? [initialAssigneeId]
            : []
      const resolvedAssignees =
        baseAssignees.length > 0
          ? baseAssignees
          : assignees.length > 0
            ? [assignees[0].id]
            : [""]

      setTitle(initialTitle)
      setDescription(initialDescription)
      setDueDate(initialDueDate)
      setAssigneeIds(resolvedAssignees)
      setPriority(initialPriority || "")
      return
    }

    if (mode === "create") {
      setTitle("")
      setDescription("")
      setDueDate("")
      setAssigneeIds([""])
      setPriority("")
    }
  }, [open, mode, initialValues, assignees])

  if (!open) return null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const cleanedAssigneeIds = (assigneeIds || [])
      .map((value) => value.trim())
      .filter(Boolean)

    const finalAssigneeIds =
      cleanedAssigneeIds.length > 0
        ? cleanedAssigneeIds
        : assignees.length > 0
          ? [assignees[0].id]
          : [""]

    const resolvedPriority: PriorityValue =
      (priority || initialValues?.priority || "medium") as PriorityValue

    const payload: NewTaskFormValues = {
      title: trimmedTitle,
      description,
      dueDate,
      assigneeId: finalAssigneeIds[0],
      assigneeIds: finalAssigneeIds,
      priority: resolvedPriority,
    }

    onSubmit(payload)
    setTitle("")
    setDescription("")
    setDueDate("")
    setAssigneeIds([])
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
              <label className="text-sm font-medium text-[#121212]">
                Assignee
              </label>
              <div className="space-y-2">
                {assigneeIds.map((value, index) => {
                  const usedIdsExcludingCurrent = assigneeIds.filter(
                    (id, i) => i !== index && id,
                  )
                  const availableAssignees = assignees.filter(
                    (assignee) =>
                      !usedIdsExcludingCurrent.includes(assignee.id) ||
                      assignee.id === value,
                  )

                  return (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={value}
                        onChange={(event) => {
                          const next = [...assigneeIds]
                          next[index] = event.target.value
                          setAssigneeIds(next)
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select contact</option>
                        {availableAssignees.map((assignee) => (
                          <option key={assignee.id} value={assignee.id}>
                            {assignee.name}
                          </option>
                        ))}
                      </select>
                      {assigneeIds.length > 1 && (
                        <button
                          type="button"
                          className="text-xs text-[#D23D3D]"
                          onClick={() => {
                            setAssigneeIds((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )
                })}
                {assigneeIds.length < assignees.length && (
                  <button
                    type="button"
                    className="text-xs font-medium text-[#64C882]"
                    onClick={() => setAssigneeIds((prev) => [...prev, ""])}
                  >
                    + Add assignee
                  </button>
                )}
              </div>
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


