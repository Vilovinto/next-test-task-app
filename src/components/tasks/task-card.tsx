import Link from "next/link"
import type { DragEvent } from "react"

type TaskCardProps = {
  taskId: string
  title: string
  description?: string
  dueDate?: string
  authorInitial: string
  onDragStart: (event: DragEvent<HTMLAnchorElement>) => void
  onDropCard: (event: DragEvent<HTMLAnchorElement>) => void
}

export function TaskCard({
  taskId,
  title,
  description,
  dueDate,
  authorInitial,
  onDragStart,
  onDropCard,
}: TaskCardProps) {
  return (
    <Link
      href={`/tasks/${taskId}`}
      className="block w-[260px] min-h-[216px] rounded-lg bg-white px-4 pt-6 pb-4 shadow-sm transition hover:shadow-md"
      draggable
      onDragStart={onDragStart}
      onDrop={onDropCard}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
      }}
    >
      <div className="mb-2 flex items-center justify-between text-sm">
        <p className="text-[16px] font-medium leading-[24px] text-[#000000] line-clamp-2">
          {title}
        </p>
      </div>
      <p className="mb-4 text-[14px] leading-[24px] text-[rgba(18,18,18,0.6)] line-clamp-3">
        {description && description.trim().length > 0
          ? description
          : "Make application design and prototype for your tasks management. Keep it simple and clean."}
      </p>
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded bg-[#64C882] px-2.5 py-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white text-[10px] text-white">
            22
          </span>
          <span className="text-[12px] leading-[18px] text-white">
            {dueDate || "7 March"}
          </span>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#C4C4C4] text-xs font-medium text-white">
          {authorInitial}
        </span>
      </div>
    </Link>
  )
}


