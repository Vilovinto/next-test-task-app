"use client"

import { useRef, useEffect } from "react"
import type { AssigneeOption } from "@/components/tasks/new-task-modal"

type AssigneeFilterProps = {
  assigneeFilterIds: string[]
  assignees: AssigneeOption[]
  isOpen: boolean
  onToggle: () => void
  onSelectAll: () => void
  onToggleAssignee: (assigneeId: string) => void
}

export function AssigneeFilter({
  assigneeFilterIds,
  assignees,
  isOpen,
  onToggle,
  onSelectAll,
  onToggleAssignee,
}: AssigneeFilterProps) {
  const filterRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        onToggle()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onToggle])

  const selectedAssignee = assignees.find(
    (a) => a.id === assigneeFilterIds[0],
  )

  return (
    <div className="relative" ref={filterRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md border border-[#E0E0E0] bg-white px-3 py-1.5 text-xs font-medium text-[#121212] shadow-sm"
        onClick={onToggle}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C4C4C4] text-[10px] font-medium text-white">
          {assigneeFilterIds.length === 1
            ? selectedAssignee?.name.trim().charAt(0).toUpperCase() ?? "A"
            : "A"}
        </span>
        <span>
          {assigneeFilterIds.length === 0
            ? "All assignees"
            : assigneeFilterIds.length === 1
              ? selectedAssignee?.name ?? "Assignee"
              : `${assigneeFilterIds.length} assignees`}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-md border bg-white py-1 text-xs shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#F7F9FD]"
            onClick={onSelectAll}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C4C4C4] text-[10px] font-medium text-white">
              A
            </span>
            <span className="font-medium text-[#121212]">All assignees</span>
          </button>
          {assignees.map((assignee) => {
            const checked = assigneeFilterIds.includes(assignee.id)
            const initial = assignee.name.trim().charAt(0).toUpperCase()
            return (
              <button
                key={assignee.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#F7F9FD]"
                onClick={() => onToggleAssignee(assignee.id)}
              >
                <span className="flex h-3 w-3 items-center justify-center rounded border border-[#CCCCCC] bg-white">
                  {checked && (
                    <span className="h-2 w-2 rounded bg-[#64C882]" />
                  )}
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C4C4C4] text-[10px] font-medium text-white">
                  {initial}
                </span>
                <span className="text-[#121212]">{assignee.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

