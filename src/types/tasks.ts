export type ColumnId = "todo" | "in_progress" | "review" | "completed"

export type Notification = {
  id: string
  userName: string
  userInitial: string
  taskTitle: string
  fromStatus: ColumnId
  toStatus: ColumnId
  timestamp: string
  read: boolean
  reviewerName?: string
  isApproval?: boolean
}

export type TaskCardData = {
  id: string
  title: string
  description?: string
  dueDate?: string
  assigneeInitial?: string
  assigneeId?: string
  assigneeIds?: string[]
  priority?: "low" | "medium" | "high"
  createdByName?: string
  assigneeName?: string
  closedAt?: string
  reviewerId?: string
  reviewerName?: string
}

export type BoardState = Record<ColumnId, TaskCardData[]>

export type MoveTaskArgs = {
  fromColumn: ColumnId
  toColumn: ColumnId
  taskId: string
  toIndex: number
}

