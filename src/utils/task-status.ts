import type { ColumnId } from "@/types/tasks"

export function getStatusLabel(column: ColumnId): string {
  const labels: Record<ColumnId, string> = {
    todo: "To do",
    in_progress: "In progress",
    review: "Review",
    completed: "Completed",
  }
  return labels[column]
}

export function getStatusColorClass(column: ColumnId): string {
  switch (column) {
    case "todo":
      return "text-[#666666]"
    case "in_progress":
      return "text-[#C97A16]"
    case "review":
      return "text-[#4B7BF5]"
    case "completed":
    default:
      return "text-[#2F8F4E]"
  }
}

