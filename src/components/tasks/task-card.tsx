import Link from "next/link"
import type { DragEvent, MouseEvent } from "react"
import { MoreIcon } from "@/components/icons/more-icon"
import { ClockIcon } from "@/components/icons/clock-icon"

type TaskCardProps = {
  taskId: string
  title: string
  description?: string
  dueDate?: string
  authorInitial: string
  onDragStart: (event: DragEvent<HTMLAnchorElement>) => void
  onDropCard: (event: DragEvent<HTMLAnchorElement>) => void
  onClick?: () => void
  onEditClick?: () => void
}

export function TaskCard({
  taskId,
  title,
  description,
  dueDate,
  authorInitial,
  onDragStart,
  onDropCard,
  onClick,
  onEditClick,
}: TaskCardProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!onClick) return
    event.preventDefault()
    onClick()
  }

  let formattedDueDate = "7 March"
  if (dueDate) {
    const date = new Date(dueDate)
    if (!Number.isNaN(date.getTime())) {
      const day = date.getDate()
      const month = date.toLocaleDateString("en-US", { month: "long" })
      formattedDueDate = `${day} ${month}`
    }
  }

  return (
    <Link
      href={`/tasks/${taskId}`}
      className="flex h-[216px] w-[260px] flex-col rounded-lg bg-white px-4 pt-6 pb-4 shadow-sm transition hover:shadow-md"
      draggable
      onDragStart={onDragStart}
      onDrop={onDropCard}
      onClick={handleClick}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
      }}
    >
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="mb-2 flex items-start justify-between text-sm">
            <p className="text-[16px] font-medium leading-[24px] text-[#000000] line-clamp-2">
              {title}
            </p>
            {onEditClick && (
              <button
                type="button"
                className="ml-2 flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#F5F6FA]"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onEditClick()
                }}
              >
                <MoreIcon />
              </button>
            )}
          </div>
          <p className="text-[14px] leading-[24px] text-[rgba(18,18,18,0.6)] line-clamp-3">
            {description && description.trim().length > 0
              ? description
              : "Make application design and prototype for your tasks management. Keep it simple and clean."}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded bg-[#64C882] px-2.5 py-1">
            <span className="flex h-4 w-4 items-center justify-center">
              <ClockIcon />
            </span>
            <span className="text-[12px] leading-[18px] text-white">
              {formattedDueDate}
            </span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#C4C4C4] text-xs font-medium text-white">
            {authorInitial}
          </span>
        </div>
      </div>
    </Link>
  )
}


