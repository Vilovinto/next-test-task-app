import type { ColumnId, Notification } from "@/types/tasks"

export function createNotification(
  userName: string,
  taskTitle: string,
  fromStatus: ColumnId,
  toStatus: ColumnId,
  reviewerName?: string,
): Notification {
  const userInitialLocal = userName.trim().charAt(0).toUpperCase()

  return {
    id: `notification-${Date.now()}-${Math.random()}`,
    userName,
    userInitial: userInitialLocal,
    taskTitle,
    fromStatus,
    toStatus,
    timestamp: new Date().toISOString(),
    read: false,
    reviewerName,
  }
}

