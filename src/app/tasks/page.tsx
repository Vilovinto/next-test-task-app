"use client"

import Link from "next/link"
import { useEffect, useState, type DragEvent } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"

import { useTasks } from "@/hooks/useTasks"
import { Button } from "@/components/ui/button"
import { clearAuthToken } from "@/lib/auth"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { firebaseAuth } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { TaskCard } from "@/components/tasks/task-card"
import { useUsers } from "@/hooks/useUsers"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardIcon } from "@/components/icons/dashboard-icon"
import { SettingsIcon } from "@/components/icons/settings-icon"
import {
  NewTaskModal,
  type AssigneeOption,
  type NewTaskFormValues,
} from "@/components/tasks/new-task-modal"

type ColumnId = "todo" | "in_progress" | "review" | "completed"

type TaskCardData = {
  id: string
  title: string
  description?: string
  dueDate?: string
  assigneeInitial?: string
}

type BoardState = Record<ColumnId, TaskCardData[]>

const BOARD_STORAGE_KEY = "tasks_board_state"

type NewTaskPayload = NewTaskFormValues

type Assignee = AssigneeOption

type MoveTaskArgs = {
  fromColumn: ColumnId
  toColumn: ColumnId
  taskId: string
  toIndex: number
}

function moveTaskInBoard(state: BoardState, args: MoveTaskArgs): BoardState {
  const { fromColumn, toColumn, taskId, toIndex } = args

  const sourceList = [...state[fromColumn]]
  const fromIndex = sourceList.findIndex((task) => task.id === taskId)
  if (fromIndex === -1) return state

  const [movedTask] = sourceList.splice(fromIndex, 1)
  const targetList = fromColumn === toColumn ? [...sourceList] : [...state[toColumn]]

  const clampedIndex = Math.max(0, Math.min(toIndex, targetList.length))
  targetList.splice(clampedIndex, 0, movedTask)

  return {
    ...state,
    [fromColumn]: sourceList,
    [toColumn]: targetList,
  }
}

export default function TasksPage() {
  const router = useRouter()
  const { user, loading } = useFirebaseUser()
  const {
    data: tasksData,
    isLoading,
    isError,
    refetch: refetchTasks,
  } = useTasks()
  const { data: users } = useUsers()
  const [board, setBoard] = useState<BoardState | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  // Initialize board from localStorage or from fetched data
  useEffect(() => {
    if (board || isLoading || isError || !tasksData) return

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(BOARD_STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as BoardState
          if (parsed && parsed.todo && parsed.in_progress && parsed.review && parsed.completed) {
            setBoard(parsed)
            return
          }
        } catch {
          window.localStorage.removeItem(BOARD_STORAGE_KEY)
        }
      }
    }

    const mappedTasks: TaskCardData[] = tasksData.map(({ id, title }) => ({
      id: String(id),
      title,
    }))

    const initialBoard: BoardState = {
      todo: mappedTasks.slice(0, 3),
      in_progress: mappedTasks.slice(3, 5),
      review: mappedTasks.slice(5, 6),
      completed: mappedTasks.slice(6, 9),
    }

    setBoard(initialBoard)
  }, [tasksData, isLoading, isError, board])

  useEffect(() => {
    if (!board || typeof window === "undefined") return
    window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board))
  }, [board])

  async function handleLogout() {
    await signOut(firebaseAuth)
    clearAuthToken()
      router.push("/login")
  }

  function handleToggleUserMenu() {
    setIsUserMenuOpen((prev) => !prev)
  }

  function handleTaskDragStart(
    event: DragEvent<HTMLAnchorElement>,
    fromColumn: ColumnId,
    taskId: string,
  ) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ fromColumn, taskId }),
    )
    event.dataTransfer.effectAllowed = "move"
  }

  function handleColumnDrop(
    event: DragEvent<HTMLDivElement>,
    targetColumn: ColumnId,
  ) {
    event.preventDefault()
    const data = event.dataTransfer.getData("application/json")
    if (!data || !board) return

    let parsed: { fromColumn: ColumnId; taskId: string }
    try {
      parsed = JSON.parse(data)
    } catch {
      return
    }

    const { fromColumn, taskId } = parsed
    if (!fromColumn || !taskId) return

    setBoard((prev) => {
      if (!prev) return prev

      const toIndex = prev[targetColumn].length
      return moveTaskInBoard(prev, {
        fromColumn,
        toColumn: targetColumn,
        taskId,
        toIndex,
      })
    })
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  function handleCardDrop(
    event: DragEvent<HTMLAnchorElement>,
    targetColumn: ColumnId,
    targetIndex: number,
  ) {
    event.preventDefault()
    event.stopPropagation()

    const data = event.dataTransfer.getData("application/json")
    if (!data || !board) return

    let parsed: { fromColumn: ColumnId; taskId: string }
    try {
      parsed = JSON.parse(data)
    } catch {
      return
    }

    const { fromColumn, taskId } = parsed
    if (!fromColumn || !taskId) return

    setBoard((prev) => {
      if (!prev) return prev

      return moveTaskInBoard(prev, {
        fromColumn,
        toColumn: targetColumn,
        taskId,
        toIndex: targetIndex,
      })
    })
  }

  if (loading || !user || !board) {
    return null
  }

  const currentAssignee: Assignee = {
    id: user.uid,
    name: user.displayName || user.email || "Current user",
  }

  const fetchedAssignees: Assignee[] =
    users?.map(({ id, displayName, email }) => ({
      id,
      name: displayName || email,
    })) ?? []

  const assignees: Assignee[] = [
    currentAssignee,
    ...fetchedAssignees.filter((assignee) => assignee.id !== currentAssignee.id),
  ]

  const { todo: todoTasks, in_progress: inProgressTasks, review: reviewTasks, completed: completedTasks } =
    board

  const { displayName, email } = user
  const authorInitial = (displayName || email || "U").trim().charAt(0).toUpperCase()

  function handleCreateTask({ title, description, dueDate, assigneeId }: NewTaskPayload) {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    if (!trimmedTitle) return

    const assignee = assignees.find((item) => item.id === assigneeId)
    const assigneeInitial =
      assignee?.name?.trim().charAt(0).toUpperCase() ?? authorInitial

    setBoard((prev) => {
      if (!prev) return prev
      const newTask: TaskCardData = {
        id: `local-${Date.now()}`,
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        dueDate: dueDate || undefined,
        assigneeInitial,
      }

      return {
        ...prev,
        todo: [newTask, ...prev.todo],
      }
    })
  }

  const today = new Date()
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" })
  const day = today.toLocaleDateString("en-US", { day: "numeric" })
  const month = today.toLocaleDateString("en-US", { month: "long" })
  const year = today.getFullYear()

  return (
    <div className="flex h-screen bg-[#F7F9FD] overflow-hidden">
      <Sidebar
        active="tasks"
        authorInitial={authorInitial}
        userName={user.displayName || "User R."}
        userEmail={user.email ?? ""}
        isUserMenuOpen={isUserMenuOpen}
        onToggleUserMenu={handleToggleUserMenu}
        onLogout={handleLogout}
        onRefreshTasks={refetchTasks}
      />

      <div
        className={cn(
          "fixed inset-0 z-30 flex bg-white transition-transform duration-200 ease-out md:hidden",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
        )}
      >
        <div className="flex w-full flex-col justify-between border-r bg-white px-7 py-10">
          <div className="space-y-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF9F24] text-sm font-medium text-white">
                  C
                </div>
                <span className="text-lg font-semibold tracking-tight text-[#121212]">
                  TESTAPP
                </span>
              </div>
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-xs text-[#121212]"
                onClick={() => setIsMobileNavOpen(false)}
              >
                Close
              </button>
            </div>

            <nav className="space-y-4 text-sm">
              <Link
                href="/tasks"
                className="flex items-center gap-3 text-[#64C882]"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center">
                  <DashboardIcon />
                </span>
                <span>Dashboard</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 text-[#AAAAAA]"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center">
                  <SettingsIcon />
                </span>
                <span>Setting</span>
              </Link>
            </nav>
          </div>

          <div className="relative mt-8">
            <button
              type="button"
              onClick={handleToggleUserMenu}
              className="flex w-full items-center gap-3 rounded-md px-1 py-1.5 text-left hover:bg-[#F7F9FD]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C4C4C4] text-xs font-medium text-white">
                {authorInitial}
              </span>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-[#000000]">
                  {user.displayName || "User R."}
                </p>
                <p className="text-[10px] text-[#AAAAAA]">{user.email}</p>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute bottom-11 left-0 z-20 w-40 rounded-md border bg-white py-1 text-xs shadow-md">
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-2 text-left hover:bg-[#F7F9FD]"
                  onClick={() => {
                    refetchTasks()
                    setIsUserMenuOpen(false)
                  }}
                >
                  Refresh tasks
                </button>
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-2 text-left hover:bg-[#F7F9FD]"
                  onClick={async () => {
                    setIsUserMenuOpen(false)
                    await handleLogout()
                    setIsMobileNavOpen(false)
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-medium leading-[30px] text-[#121212]">
              My Tasks
            </h1>
            <p className="mt-1 text-[14px] font-normal leading-[21px]">
              <span className="text-[#64C882]">{weekday}, </span>
              <span className="text-[#AAAAAA]">
                {month} {day} {year}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="rounded-lg bg-[#64C882] px-4 text-sm font-medium text-white hover:bg-[#52b66c]"
              onClick={() => setIsCreateOpen(true)}
            >
              + New task
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileNavOpen(true)}
            >
              Menu
            </Button>
          </div>
        </header>

        {isError && (
          <p className="mb-4 text-sm text-destructive">
            An error occurred while loading tasks. Please check the API URL or network.
          </p>
        )}

        <section className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <h2 className="mb-4 text-[16px] font-medium leading-[24px] text-[#121212]">
              To do{" "}
              <span className="text-xs text-muted-foreground">
                ({todoTasks.length})
              </span>
            </h2>
            <div className="flex flex-col gap-4">
              {isLoading && (
                <div className="h-[216px] w-[260px] rounded-lg bg-white/70 shadow-sm" />
              )}
              {todoTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  description={task.description}
                  dueDate={task.dueDate}
                  authorInitial={task.assigneeInitial ?? authorInitial}
                  onDragStart={(event) =>
                    handleTaskDragStart(event, "todo", task.id)
                  }
                  onDropCard={(event) => handleCardDrop(event, "todo", index)}
                />
              ))}
              <div
                className="h-[216px] w-[260px] rounded-lg border border-dashed border-[#AAAAAA] bg-[#F7F9FD]"
                onDrop={(event) => handleColumnDrop(event, "todo")}
                onDragOver={handleDragOver}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-[16px] font-medium leading-[24px] text-[#121212]">
              In progress{" "}
              <span className="text-xs text-muted-foreground">
                ({inProgressTasks.length})
              </span>
            </h2>
            <div className="flex flex-col gap-4">
              {isLoading && (
                <div className="h-[216px] w-[260px] rounded-lg bg-white/70 shadow-sm" />
              )}
              {inProgressTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  description={task.description}
                  dueDate={task.dueDate}
                  authorInitial={authorInitial}
                  onDragStart={(event) =>
                    handleTaskDragStart(event, "in_progress", task.id)
                  }
                  onDropCard={(event) =>
                    handleCardDrop(event, "in_progress", index)
                  }
                />
              ))}
              <div
                className="h-[216px] w-[260px] rounded-lg border border-dashed border-[#AAAAAA] bg-[#F7F9FD]"
                onDrop={(event) => handleColumnDrop(event, "in_progress")}
                onDragOver={handleDragOver}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-[16px] font-medium leading-[24px] text-[#121212]">
              Review{" "}
              <span className="text-xs text-muted-foreground">
                ({reviewTasks.length})
              </span>
            </h2>
            <div className="flex flex-col gap-4">
              {isLoading && (
                <div className="h-[216px] w-[260px] rounded-lg bg-white/70 shadow-sm" />
              )}
              {reviewTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  description={task.description}
                  dueDate={task.dueDate}
                  authorInitial={authorInitial}
                  onDragStart={(event) =>
                    handleTaskDragStart(event, "review", task.id)
                  }
                  onDropCard={(event) =>
                    handleCardDrop(event, "review", index)
                  }
                />
              ))}
              <div
                className="h-[216px] w-[260px] rounded-lg border border-dashed border-[#AAAAAA] bg-[#F7F9FD]"
                onDrop={(event) => handleColumnDrop(event, "review")}
                onDragOver={handleDragOver}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-[16px] font-medium leading-[24px] text-[#121212]">
              Completed{" "}
              <span className="text-xs text-muted-foreground">
                ({completedTasks.length})
              </span>
            </h2>
            <div className="flex flex-col gap-4">
              {isLoading && (
                <div className="h-[216px] w-[260px] rounded-lg bg-white/70 shadow-sm" />
              )}
              {completedTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  description={task.description}
                  dueDate={task.dueDate}
                  authorInitial={authorInitial}
                  onDragStart={(event) =>
                    handleTaskDragStart(event, "completed", task.id)
                  }
                  onDropCard={(event) =>
                    handleCardDrop(event, "completed", index)
                  }
                />
              ))}
              <div
                className="h-[216px] w-[260px] rounded-lg border border-dashed border-[#AAAAAA] bg-[#F7F9FD]"
                onDrop={(event) => handleColumnDrop(event, "completed")}
                onDragOver={handleDragOver}
              />
            </div>
          </div>
        </section>
      </main>
      <NewTaskModal
        open={isCreateOpen}
        assignees={assignees}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(values) => {
          handleCreateTask(values)
          setIsCreateOpen(false)
        }}
      />
    </div>
  )
}
