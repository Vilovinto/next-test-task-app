import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { MoreIcon } from "@/components/icons/more-icon"
import { ClockIcon } from "@/components/icons/clock-icon"
import { TaskStatusIcon } from "@/components/icons/task-status-icons"
import type { TaskStatus } from "@/lib/api"

type TaskCardProps = {
  taskId: string
  title: string
  description?: string
  dueDate?: string
  status: TaskStatus
  priority?: "low" | "medium" | "high"
  authorInitial: string
  assigneeInitials?: string[]
  closedAt?: string
  onDragStart: (event: DragEvent<HTMLAnchorElement>) => void
  onDropCard: (event: DragEvent<HTMLAnchorElement>) => void
  onClick?: () => void
  onEditClick?: () => void
  onDeleteClick?: () => void
  onApproveClick?: () => void
}

export function TaskCard({
  taskId,
  title,
  description,
  dueDate,
  status,
  priority = "medium",
  authorInitial,
  assigneeInitials,
  closedAt,
  onDragStart,
  onDropCard,
  onClick,
  onEditClick,
  onDeleteClick,
  onApproveClick,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  function handleClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (!onClick) return
    event.preventDefault()
    onClick()
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isMenuOpen])

  let formattedDueDate = "7 March"
  let isOverdue = false
  if (dueDate) {
    const date = new Date(dueDate)
    if (!Number.isNaN(date.getTime())) {
      const day = date.getDate()
      const month = date.toLocaleDateString("en-US", { month: "long" })
      formattedDueDate = `${day} ${month}`

      const due = new Date(date)
      due.setHours(0, 0, 0, 0)
      if (status === "done" && closedAt) {
        const closed = new Date(closedAt)
        closed.setHours(0, 0, 0, 0)
        isOverdue = closed > due
      } else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        isOverdue = due < today
      }
    }
  }

  const statusColorClass =
    status === "todo"
      ? "text-[#AAAAAA]"
      : status === "in_progress"
        ? "text-[#FF9F24]"
        : status === "review"
          ? "text-[#4B7BF5]"
          : "text-[#64C882]"

  const priorityBars =
    priority === "low" ? 1 : priority === "medium" ? 2 : 3

  const priorityColorClass =
    priority === "low"
      ? "bg-[#AAAAAA]"
      : priority === "medium"
        ? "bg-[#FF9F24]"
        : "bg-[#D23D3D]"

  const allAssigneeInitials =
    assigneeInitials && assigneeInitials.length > 0
      ? assigneeInitials
      : [authorInitial]

  const maxVisibleAvatars = 3
  const visibleInitials = allAssigneeInitials.slice(0, maxVisibleAvatars)
  const extraAssignees =
    allAssigneeInitials.length > maxVisibleAvatars
      ? allAssigneeInitials.length - maxVisibleAvatars
      : 0

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
            {(onEditClick || onDeleteClick) && (
              <div className="relative ml-2" ref={menuRef}>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#F5F6FA]"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setIsMenuOpen((prev) => !prev)
                  }}
                >
                  <MoreIcon />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-7 z-30 w-40 rounded-md border border-[#F5F6FA] bg-white py-1 text-sm shadow-lg">
                    {onEditClick && (
                      <button
                        type="button"
                        className="flex w-full items-center px-3 py-2 text-left hover:bg-[#F7F9FD]"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setIsMenuOpen(false)
                          onEditClick()
                        }}
                      >
                        Edit task
                      </button>
                    )}
                    {onApproveClick && (
                      <button
                        type="button"
                        className="flex w-full items-center px-3 py-2 text-left text-[#64C882] hover:bg-[#E5F7EB]"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setIsMenuOpen(false)
                          onApproveClick()
                        }}
                      >
                        Approve task
                      </button>
                    )}
                    {onDeleteClick && (
                      <button
                        type="button"
                        className="flex w-full items-center px-3 py-2 text-left text-[#D23D3D] hover:bg-[#FDECEC]"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setIsMenuOpen(false)
                          onDeleteClick()
                        }}
                      >
                        Delete task
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-[14px] leading-[24px] text-[rgba(18,18,18,0.6)] line-clamp-3">
            {description && description.trim().length > 0
              ? description
              : "Make application design and prototype for your tasks management. Keep it simple and clean."}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-2 rounded px-2.5 py-1 ${
              isOverdue ? "bg-[#D23D3D]" : "bg-[#64C882]"
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <ClockIcon />
            </span>
            <span className="text-[12px] leading-[18px] text-white">
              {formattedDueDate}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              {Array.from({ length: priorityBars }).map((_, index) => (
                <span
                  key={index}
                  className={`inline-block h-3 w-0.5 rounded-full ${priorityColorClass}`}
                />
              ))}
            </span>
            <span className={statusColorClass}>
              <TaskStatusIcon status={status} />
            </span>
            <div className="flex -space-x-2">
              {visibleInitials.map((initial, index) => (
                <span
                  key={`${initial}-${index}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#C4C4C4] text-xs font-medium text-white"
                >
                  {initial}
                </span>
              ))}
              {extraAssignees > 0 && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#E5F7EB] text-[10px] font-medium text-[#121212]">
                  +{extraAssignees}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}


