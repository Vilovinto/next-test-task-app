"use client"

import { Button } from "@/components/ui/button"
import type { AssigneeOption } from "@/components/tasks/new-task-modal"
import type { ColumnId } from "@/types/tasks"

type ReviewerSelectionModalProps = {
  open: boolean
  reviewingTaskId: string | null
  previousReviewColumn: ColumnId | null
  selectedReviewerId: string
  availableReviewers: AssigneeOption[]
  onSelectReviewer: (reviewerId: string) => void
  onCancel: () => void
  onConfirm: () => void
  onMoveTaskBack: (taskId: string, fromColumn: ColumnId, toColumn: ColumnId) => void
}

export function ReviewerSelectionModal({
  open,
  reviewingTaskId,
  previousReviewColumn,
  selectedReviewerId,
  availableReviewers,
  onSelectReviewer,
  onCancel,
  onConfirm,
  onMoveTaskBack,
}: ReviewerSelectionModalProps) {
  if (!open || !reviewingTaskId) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold text-[#121212]">Select reviewer</h2>
        <p className="mb-6 text-sm text-[#666666]">
          Choose a user who will review this task.
        </p>
        <label className="mb-2 block text-xs font-medium text-[#121212]">
          Reviewer
        </label>
        <select
          className="mb-8 block w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#121212] outline-none focus:border-[#64C882]"
          value={selectedReviewerId}
          onChange={(event) => onSelectReviewer(event.target.value)}
        >
          <option value="" disabled>
            Select reviewer
          </option>
          {availableReviewers.map((reviewer) => (
            <option key={reviewer.id} value={reviewer.id}>
              {reviewer.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (reviewingTaskId && previousReviewColumn) {
                onMoveTaskBack(reviewingTaskId, "review", previousReviewColumn)
              }
              onCancel()
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-[#64C882] text-white hover:bg-[#52b66c]"
            disabled={!selectedReviewerId}
            onClick={onConfirm}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

