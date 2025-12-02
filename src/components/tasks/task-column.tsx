"use client"

import { type DragEvent } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import type { TaskCardData, ColumnId } from "@/types/tasks"

type TaskColumnProps = {
  title: string
  columnId: ColumnId
  tasks: TaskCardData[]
  isLoading: boolean
  authorInitial: string
  getAssigneeInitials: (task: TaskCardData) => string[]
  onTaskClick: (taskId: string) => void
  onTaskEdit: (taskId: string) => void
  onTaskDelete: (taskId: string) => void
  onTaskApprove?: (taskId: string) => void
  onTaskDragStart: (event: DragEvent<HTMLAnchorElement>, column: ColumnId, taskId: string) => void
  onCardDrop: (event: DragEvent<HTMLAnchorElement>, column: ColumnId, index: number) => void
  onColumnDrop: (event: DragEvent<HTMLDivElement>, column: ColumnId) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  reviewerId?: string
  currentUserId?: string
}

export function TaskColumn({
  title,
  columnId,
  tasks,
  isLoading,
  authorInitial,
  getAssigneeInitials,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskApprove,
  onTaskDragStart,
  onCardDrop,
  onColumnDrop,
  onDragOver,
  reviewerId,
  currentUserId,
}: TaskColumnProps) {
  const statusMap: Record<ColumnId, "todo" | "in_progress" | "review" | "done"> = {
    todo: "todo",
    in_progress: "in_progress",
    review: "review",
    completed: "done",
  }

  return (
    <div>
      <h2 className="mb-4 text-[16px] font-medium leading-[24px] text-[#121212]">
        {title}{" "}
        <span className="text-xs text-muted-foreground">({tasks.length})</span>
      </h2>
      <div className="flex flex-col gap-4">
        {isLoading && (
          <div className="h-[216px] w-[260px] rounded-lg bg-white/70 shadow-sm" />
        )}
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            taskId={task.id}
            title={task.title}
            description={task.description}
            dueDate={task.dueDate}
            status={statusMap[columnId]}
            priority={task.priority}
            authorInitial={task.assigneeInitial ?? authorInitial}
            assigneeInitials={getAssigneeInitials(task)}
            closedAt={task.closedAt}
            onClick={() => onTaskClick(task.id)}
            onEditClick={() => onTaskEdit(task.id)}
            onDeleteClick={() => onTaskDelete(task.id)}
            onApproveClick={
              onTaskApprove && reviewerId === currentUserId
                ? () => onTaskApprove(task.id)
                : undefined
            }
            onDragStart={(event) => onTaskDragStart(event, columnId, task.id)}
            onDropCard={(event) => onCardDrop(event, columnId, index)}
          />
        ))}
        <div
          className="h-[216px] w-[260px] rounded-lg border border-dashed border-[#AAAAAA] bg-[#F7F9FD]"
          onDrop={(event) => onColumnDrop(event, columnId)}
          onDragOver={onDragOver}
        />
      </div>
    </div>
  )
}

