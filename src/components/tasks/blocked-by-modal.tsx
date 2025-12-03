"use client"

import { Button } from "@/components/ui/button"
import type { TaskCardData } from "@/types/tasks"

type BlockingTaskOption = {
  id: string
  title: string
}

type BlockedByModalProps = {
  open: boolean
  taskTitle?: string
  blockingTaskId: string | null
  selectedBlockingTaskId: string
  options: BlockingTaskOption[]
  onSelect: (taskId: string) => void
  onCancel: () => void
  onConfirm: () => void
  onMoveBack: () => void
}

export function BlockedByModal({
  open,
  taskTitle,
  blockingTaskId,
  selectedBlockingTaskId,
  options,
  onSelect,
  onCancel,
  onConfirm,
  onMoveBack,
}: BlockedByModalProps) {
  if (!open || !blockingTaskId) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold text-[#121212]">Specify blocker</h2>
        <p className="mb-6 text-sm text-[#666666]">
          Select a task that is blocking
          {taskTitle ? (
            <>
              {" "}
              <span className="font-medium text-[#121212]">"{taskTitle}"</span>
            </>
          ) : null}
          .
        </p>
        <label className="mb-2 block text-xs font-medium text-[#121212]">
          Blocked by
        </label>
        <select
          className="mb-8 block w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#121212] outline-none focus:border-[#64C882]"
          value={selectedBlockingTaskId}
          onChange={(event) => onSelect(event.target.value)}
        >
          <option value="" disabled>
            Select task
          </option>
          {options.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onMoveBack()
              onCancel()
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-[#64C882] text-white hover:bg-[#52b66c]"
            disabled={!selectedBlockingTaskId}
            onClick={onConfirm}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}


