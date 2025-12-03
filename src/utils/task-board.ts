import type { BoardState, MoveTaskArgs, TaskCardData } from "@/types/tasks"

export function moveTaskInBoard(state: BoardState, args: MoveTaskArgs): BoardState {
  const { fromColumn, toColumn, taskId, toIndex } = args

  const sourceList = [...state[fromColumn]]
  const fromIndex = sourceList.findIndex((task) => task.id === taskId)
  if (fromIndex === -1) return state

  const [originalTask] = sourceList.splice(fromIndex, 1)

  let movedTask: TaskCardData = originalTask

  if (fromColumn === "review" && toColumn !== "review" && toColumn !== "completed") {
    movedTask = {
      ...movedTask,
      reviewerId: undefined,
      reviewerName: undefined,
    }
  }

  if (toColumn === "completed" && !movedTask.closedAt) {
    movedTask = {
      ...movedTask,
      closedAt: new Date().toISOString(),
    }
  }

  if (fromColumn === "completed" && toColumn !== "completed" && movedTask.closedAt) {
    movedTask = {
      ...movedTask,
      closedAt: undefined,
    }
  }

  if (fromColumn === "blocked" && toColumn !== "blocked") {
    movedTask = {
      ...movedTask,
      blockedByTaskId: undefined,
      blockedByTaskTitle: undefined,
    }
  }

  const targetList = fromColumn === toColumn ? [...sourceList] : [...state[toColumn]]

  const clampedIndex = Math.max(0, Math.min(toIndex, targetList.length))
  targetList.splice(clampedIndex, 0, movedTask)

  return {
    ...state,
    [fromColumn]: sourceList,
    [toColumn]: targetList,
  }
}

