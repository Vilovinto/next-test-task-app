"use client"

import { useCallback, useEffect, useState, type DragEvent } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, setDoc } from "firebase/firestore"

import { useTasks } from "@/hooks/useTasks"
import { Button } from "@/components/ui/button"
import { useFirebaseUser } from "@/hooks/useFirebaseUser"
import { useUsers } from "@/hooks/useUsers"
import { firebaseDb } from "@/lib/firebase"
import { Sidebar } from "@/components/layout/sidebar"
import {
  NewTaskModal,
  type AssigneeOption,
  type NewTaskFormValues,
  type PriorityValue,
} from "@/components/tasks/new-task-modal"
import { TaskDetailsModal } from "@/components/tasks/task-details-modal"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ReviewerSelectionModal } from "@/components/tasks/reviewer-selection-modal"
import { BlockedByModal } from "@/components/tasks/blocked-by-modal"
import { AssigneeFilter } from "@/components/tasks/assignee-filter"
import { NotificationsDropdown } from "@/components/tasks/notifications-dropdown"
import { MobileNavigation } from "@/components/layout/mobile-navigation"
import { TaskColumn } from "@/components/tasks/task-column"
import type {
  ColumnId,
  Notification,
  TaskCardData,
  BoardState,
} from "@/types/tasks"
import { moveTaskInBoard } from "@/utils/task-board"
import { createNotification } from "@/utils/notifications"

type Assignee = AssigneeOption
type NewTaskPayload = NewTaskFormValues

export default function TasksPage() {
  const router = useRouter()
  const { user, loading } = useFirebaseUser()
  const {
    data: tasksData,
    isLoading,
    isError,
  } = useTasks()
  const { data: users } = useUsers()
  const [board, setBoard] = useState<BoardState | null>(null)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [openedTaskId, setOpenedTaskId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [approvingTaskId, setApprovingTaskId] = useState<string | null>(null)
  const [assigneeFilterIds, setAssigneeFilterIds] = useState<string[]>([])
  const [isAssigneeFilterOpen, setIsAssigneeFilterOpen] = useState(false)
  const [reviewingTaskId, setReviewingTaskId] = useState<string | null>(null)
  const [previousReviewColumn, setPreviousReviewColumn] = useState<ColumnId | null>(
    null,
  )
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("")
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [blockingTaskId, setBlockingTaskId] = useState<string | null>(null)
  const [previousBlockedColumn, setPreviousBlockedColumn] =
    useState<ColumnId | null>(null)
  const [selectedBlockingTaskId, setSelectedBlockingTaskId] = useState<string>("")

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user || !user.uid || board || isLoading || isError || !tasksData) return

    async function loadBoard() {
      try {
        const boardRef = doc(firebaseDb, "boards", user!.uid)
        const snapshot = await getDoc(boardRef)

        if (snapshot.exists()) {
          const raw = snapshot.data() as Partial<BoardState>
          const normalized: BoardState = {
            todo: raw.todo ?? [],
            in_progress: raw.in_progress ?? [],
            review: raw.review ?? [],
            blocked: raw.blocked ?? [],
            rejected: raw.rejected ?? [],
            completed: raw.completed ?? [],
          }
          setBoard(normalized)
          return
        }
      } catch (error) {
        console.error("Failed to load board from Firestore", error)
      }

      const mappedTasks: TaskCardData[] = (tasksData ?? []).map(({ id, title }) => ({
        id: String(id),
        title,
        priority: "medium",
      }))

      const initialBoard: BoardState = {
        todo: mappedTasks.slice(0, 3),
        in_progress: mappedTasks.slice(3, 5),
        review: mappedTasks.slice(5, 6),
        blocked: [],
        rejected: [],
        completed: mappedTasks.slice(6, 9),
      }

      setBoard(initialBoard)

      try {
        await setDoc(doc(firebaseDb, "boards", user!.uid), initialBoard)
      } catch (error) {
        console.error("Failed to save initial board to Firestore", error)
      }
    }

    void loadBoard()
  }, [user, board, isLoading, isError, tasksData])

  useEffect(() => {
    if (!board || !user || !user.uid) return

    async function persistBoard() {
      try {
        await setDoc(doc(firebaseDb, "boards", user!.uid), board, { merge: true })
      } catch (error) {
        console.error("Failed to save board to Firestore", error)
      }
    }

    void persistBoard()
  }, [board, user])

  function addNotification(notification: Notification) {
    setNotifications((prev) => [notification, ...prev])
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

    if (fromColumn !== "review" && targetColumn === "review") {
      setReviewingTaskId(taskId)
      setPreviousReviewColumn(fromColumn)
    } else if (fromColumn !== "blocked" && targetColumn === "blocked") {
      setBlockingTaskId(taskId)
      setPreviousBlockedColumn(fromColumn)
    } else if (fromColumn !== targetColumn && board) {
      const task = board[fromColumn].find((t) => t.id === taskId)
      if (task && user) {
        const userName = user.displayName || user.email || "Unknown user"
        const notification = createNotification(
          userName,
          task.title,
          fromColumn,
          targetColumn,
        )
        addNotification(notification)
      }
    }

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

    if (fromColumn !== "review" && targetColumn === "review") {
      setReviewingTaskId(taskId)
      setPreviousReviewColumn(fromColumn)
    } else if (fromColumn !== "blocked" && targetColumn === "blocked") {
      setBlockingTaskId(taskId)
      setPreviousBlockedColumn(fromColumn)
    } else if (fromColumn !== targetColumn && board) {
      const task = board[fromColumn].find((t) => t.id === taskId)
      if (task && user) {
        const userName = user.displayName || user.email || "Unknown user"
        const notification = createNotification(
          userName,
          task.title,
          fromColumn,
          targetColumn,
        )
        addNotification(notification)
      }
    }

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

  const displayName = user?.displayName
  const email = user?.email
  const uid = user?.uid

  const currentAssignee: Assignee = {
    id: uid ?? "",
    name: displayName || email || "Current user",
  }

  const fetchedAssignees: Assignee[] =
    users?.map(({ id, displayName, email }) => ({
      id,
      name: displayName || email,
    })) ?? []

  const assignees: Assignee[] = [
    currentAssignee,
    ...fetchedAssignees.filter(({ id }) => id !== currentAssignee.id),
  ]

  const authorInitial = (displayName || email || "U").trim().charAt(0).toUpperCase()

  const getAvailableReviewersForTask = useCallback(
    (taskId: string | null): Assignee[] => {
      if (!taskId || !board || !user) return []

      const reviewTask =
        board.review.find((task) => task.id === taskId) ??
        board.todo.find((task) => task.id === taskId) ??
        board.in_progress.find((task) => task.id === taskId) ??
        board.completed.find((task) => task.id === taskId)

      if (!reviewTask) return []

      const assignedIds: string[] =
        (reviewTask.assigneeIds && reviewTask.assigneeIds.length > 0
          ? reviewTask.assigneeIds
          : reviewTask.assigneeId
            ? [reviewTask.assigneeId]
            : []) as string[]

      const fetchedAssigneesLocal: Assignee[] =
        users?.map(({ id, displayName, email }) => ({
          id,
          name: displayName || email,
        })) ?? []

      const currentAssigneeLocal: Assignee = {
        id: user.uid,
        name: displayName || email || "Current user",
      }

      const allAssigneesForReview: Assignee[] = [
        currentAssigneeLocal,
        ...fetchedAssigneesLocal.filter(({ id }) => id !== currentAssigneeLocal.id),
      ]

      return allAssigneesForReview.filter(
        (assignee) => !assignedIds.includes(assignee.id),
      )
    },
    [board, user, users, displayName, email],
  )

  useEffect(() => {
    if (!reviewingTaskId || !board || !user) return

    const availableReviewers = getAvailableReviewersForTask(reviewingTaskId)

    if (availableReviewers.length === 0) {
      setSelectedReviewerId("")
      return
    }

    setSelectedReviewerId("")
  }, [reviewingTaskId, board, user, users, getAvailableReviewersForTask])

  const getBlockingTaskOptions = useCallback(
    (taskId: string | null) => {
      if (!board || !taskId) return []

      const all: TaskCardData[] = [
        ...board.todo,
        ...board.in_progress,
        ...board.review,
        ...board.blocked,
        ...board.rejected,
        ...board.completed,
      ]

      return all
        .filter((task) => task.id !== taskId)
        .map((task) => ({ id: task.id, title: task.title || "Untitled task" }))
    },
    [board],
  )

  if (loading || !user || !board) {
    return null
  }

  const {
    todo: todoTasks,
    in_progress: inProgressTasks,
    review: reviewTasks,
    blocked: blockedTasks,
    rejected: rejectedTasks,
    completed: completedTasks,
  } =
    board

  const allTasks = [
    ...todoTasks,
    ...inProgressTasks,
    ...reviewTasks,
    ...blockedTasks,
    ...rejectedTasks,
    ...completedTasks,
  ]

  const allTasksWithColumn = [
    ...todoTasks.map((task) => ({ task, column: "todo" as ColumnId })),
    ...inProgressTasks.map((task) => ({
      task,
      column: "in_progress" as ColumnId,
    })),
    ...reviewTasks.map((task) => ({ task, column: "review" as ColumnId })),
    ...blockedTasks.map((task) => ({ task, column: "blocked" as ColumnId })),
    ...rejectedTasks.map((task) => ({ task, column: "rejected" as ColumnId })),
    ...completedTasks.map((task) => ({
      task,
      column: "completed" as ColumnId,
    })),
  ]

  const filteredTodoTasks = todoTasks.filter(taskMatchesFilter)
  const filteredInProgressTasks = inProgressTasks.filter(taskMatchesFilter)
  const filteredReviewTasks = reviewTasks.filter(taskMatchesFilter)
  const filteredBlockedTasks = blockedTasks.filter(taskMatchesFilter)
  const filteredRejectedTasks = rejectedTasks.filter(taskMatchesFilter)
  const filteredCompletedTasks = completedTasks.filter(taskMatchesFilter)

  function handleConfirmReviewer() {
    if (!reviewingTaskId || !selectedReviewerId) {
      setReviewingTaskId(null)
      setPreviousReviewColumn(null)
      return
    }

    const reviewer = assignees.find((a) => a.id === selectedReviewerId)
    const reviewerName = reviewer?.name ?? ""

    if (board && previousReviewColumn && user) {
      const task =
        board.review.find((t) => t.id === reviewingTaskId) ??
        board[previousReviewColumn].find((t) => t.id === reviewingTaskId)
      if (task) {
        const userName = user.displayName || user.email || "Unknown user"
        const notification = createNotification(
          userName,
          task.title,
          previousReviewColumn,
          "review",
          reviewerName,
        )
        addNotification(notification)
      }
    }

    setBoard((prev) => {
      if (!prev) return prev

      const next: BoardState = (Object.keys(prev) as ColumnId[]).reduce(
        (acc, column) => {
          const tasks = prev[column]
          const index = tasks.findIndex((task) => task.id === reviewingTaskId)
          if (index === -1) {
            acc[column] = tasks
            return acc
          }

          const task = tasks[index]
          acc[column] = [
            ...tasks.slice(0, index),
            {
              ...task,
              reviewerId: selectedReviewerId,
              reviewerName,
            },
            ...tasks.slice(index + 1),
          ]
          return acc
        },
        {} as BoardState,
      )

      return next
    })

    setReviewingTaskId(null)
    setPreviousReviewColumn(null)
  }

  function handleConfirmBlockedBy() {
    if (!blockingTaskId || !selectedBlockingTaskId || !board) {
      setBlockingTaskId(null)
      setPreviousBlockedColumn(null)
      setSelectedBlockingTaskId("")
      return
    }

    const selectedTaskTitle =
      getBlockingTaskOptions(blockingTaskId).find(
        (task) => task.id === selectedBlockingTaskId,
      )?.title ?? ""

    setBoard((prev) => {
      if (!prev) return prev

      const next: BoardState = (Object.keys(prev) as ColumnId[]).reduce(
        (acc, column) => {
          const tasks = prev[column]
          const index = tasks.findIndex((task) => task.id === blockingTaskId)
          if (index === -1) {
            acc[column] = tasks
            return acc
          }

          const task = tasks[index]
          acc[column] = [
            ...tasks.slice(0, index),
            {
              ...task,
              blockedByTaskId: selectedBlockingTaskId,
              blockedByTaskTitle: selectedTaskTitle,
            },
            ...tasks.slice(index + 1),
          ]
          return acc
        },
        {} as BoardState,
      )

      return next
    })

    setBlockingTaskId(null)
    setPreviousBlockedColumn(null)
    setSelectedBlockingTaskId("")
  }

  function handleApproveTask() {
    if (!approvingTaskId || !board || !user) return

    const allTasks = [
      ...board.todo,
      ...board.in_progress,
      ...board.review,
      ...board.completed,
    ]
    const task = allTasks.find((t) => t.id === approvingTaskId)
    if (!task) return

    const currentColumn = (Object.keys(board) as ColumnId[]).find((column) =>
      board[column].some((t) => t.id === approvingTaskId),
    )
    if (!currentColumn) return

    const userName = user.displayName || user.email || "Unknown user"
    const reviewerName = task.reviewerName || "Unknown reviewer"

    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random()}`,
      userName,
      userInitial: userName.trim().charAt(0).toUpperCase(),
      taskTitle: task.title,
      fromStatus: currentColumn,
      toStatus: currentColumn,
      timestamp: new Date().toISOString(),
      read: false,
      reviewerName,
      isApproval: true,
    }
    setNotifications((prev) => [notification, ...prev])

    setApprovingTaskId(null)
  }

  function getAssigneeInitials(task: TaskCardData): string[] {
    const ids =
      (task.assigneeIds && task.assigneeIds.length > 0
        ? task.assigneeIds
        : task.assigneeId
          ? [task.assigneeId]
          : []) as string[]

    const initials = ids
      .map((id) => {
        const assignee = assignees.find((item) => item.id === id)
        const name =
          assignee?.name ??
          task.assigneeName ??
          currentAssignee.name ??
          displayName ??
          email ??
          ""
        return name.trim().charAt(0).toUpperCase()
      })
      .filter(Boolean)

    if (initials.length > 0) return initials
    if (task.assigneeInitial) return [task.assigneeInitial]
    return [authorInitial]
  }

  function getAssigneeNames(task: TaskCardData): string[] {
    const ids =
      (task.assigneeIds && task.assigneeIds.length > 0
        ? task.assigneeIds
        : task.assigneeId
          ? [task.assigneeId]
          : []) as string[]

    const names = ids
      .map((id) => {
        const assignee = assignees.find((item) => item.id === id)
        return (
          assignee?.name ??
          task.assigneeName ??
          currentAssignee.name ??
          displayName ??
          email ??
          ""
        )
      })
      .map((name) => name.trim())
      .filter(Boolean)

    if (names.length > 0) {
      return Array.from(new Set(names))
    }

    const fallbackName =
      task.assigneeName ??
      currentAssignee.name ??
      displayName ??
      email ??
      ""

    return fallbackName ? [fallbackName.trim()] : []
  }

  function taskMatchesFilter(task: TaskCardData): boolean {
    if (assigneeFilterIds.length === 0) return true

    const baseIds =
      (task.assigneeIds && task.assigneeIds.length > 0
        ? task.assigneeIds
        : task.assigneeId
          ? [task.assigneeId]
          : []) as string[]

    const ids = [
      ...baseIds,
      ...(task.reviewerId ? [task.reviewerId] : []),
    ]

    if (ids.length > 0) {
      return ids.some((id) => assigneeFilterIds.includes(id))
    }

    const taskNames = [
      ...getAssigneeNames(task),
      ...(task.reviewerName ? [task.reviewerName] : []),
    ]
    if (taskNames.length === 0) return false

    const selectedNames = assignees
      .filter((assignee) => assigneeFilterIds.includes(assignee.id))
      .map((assignee) => assignee.name.trim())

    if (selectedNames.length === 0) return false

    return taskNames.some((name) => selectedNames.includes(name))
  }

  function handleCreateTask({
    title,
    description,
    dueDate,
    assigneeId,
    assigneeIds,
    priority,
  }: NewTaskPayload) {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    if (!trimmedTitle) return

    const selectedAssigneeIdsRaw =
      assigneeIds && assigneeIds.length > 0
        ? assigneeIds
        : assigneeId
          ? [assigneeId]
          : []

    const selectedAssigneeIds =
      selectedAssigneeIdsRaw.length > 0
        ? selectedAssigneeIdsRaw
        : [assignees[0]?.id ?? currentAssignee.id]

    const assignee = assignees.find((item) => item.id === selectedAssigneeIds[0])
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
        assigneeId: selectedAssigneeIds[0],
        assigneeIds: selectedAssigneeIds,
        priority: (priority ?? "medium") as PriorityValue,
        createdByName: currentAssignee.name,
        assigneeName: assignee?.name ?? currentAssignee.name,
      }

      return {
        ...prev,
        todo: [newTask, ...prev.todo],
      }
    })
  }

  function handleUpdateTask({
    title,
    description,
    dueDate,
    assigneeId,
    assigneeIds,
    priority,
  }: NewTaskPayload) {
    if (!editingTaskId) return

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    if (!trimmedTitle) return

    const selectedAssigneeIdsRaw =
      assigneeIds && assigneeIds.length > 0
        ? assigneeIds
        : assigneeId
          ? [assigneeId]
          : []

    const selectedAssigneeIds =
      selectedAssigneeIdsRaw.length > 0
        ? selectedAssigneeIdsRaw
        : [assignees[0]?.id ?? currentAssignee.id]

    const assignee = assignees.find((item) => item.id === selectedAssigneeIds[0])
    const assigneeInitial =
      assignee?.name?.trim().charAt(0).toUpperCase() ?? authorInitial

    setBoard((prev) => {
      if (!prev) return prev

      let updated = false

      const next: BoardState = (Object.keys(prev) as ColumnId[]).reduce(
        (acc, column) => {
          const tasks = prev[column]
          const index = tasks.findIndex((task) => task.id === editingTaskId)
          if (index === -1) {
            acc[column] = tasks
            return acc
          }

          updated = true
          const task = tasks[index]
          acc[column] = [
            ...tasks.slice(0, index),
            {
              ...task,
              title: trimmedTitle,
              description: trimmedDescription || undefined,
              dueDate: dueDate || undefined,
              assigneeInitial,
              assigneeId:
                selectedAssigneeIds[0] || task.assigneeId || currentAssignee.id,
              assigneeIds: selectedAssigneeIds,
              priority: (priority ?? task.priority ?? "medium") as PriorityValue,
              assigneeName: assignee?.name ?? task.assigneeName ?? currentAssignee.name,
            },
            ...tasks.slice(index + 1),
          ]
          return acc
        },
        {} as BoardState,
      )

      return updated ? next : prev
    })
  }
  const today = new Date()
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" })
  const day = today.toLocaleDateString("en-US", { day: "numeric" })
  const month = today.toLocaleDateString("en-US", { month: "long" })
  const year = today.getFullYear()

  return (
    <div className="flex h-screen bg-[#F7F9FD] overflow-hidden">
      <Sidebar active="tasks" />

      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activePage="tasks"
        userInitial={authorInitial}
        displayName={displayName}
        email={email}
      />

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-start gap-4">
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
            <AssigneeFilter
              assigneeFilterIds={assigneeFilterIds}
              assignees={assignees}
              isOpen={isAssigneeFilterOpen}
              onToggle={() => setIsAssigneeFilterOpen((prev) => !prev)}
              onSelectAll={() => setAssigneeFilterIds([])}
              onToggleAssignee={(assigneeId) => {
                setAssigneeFilterIds((prev) =>
                  prev.includes(assigneeId)
                    ? prev.filter((id) => id !== assigneeId)
                    : [...prev, assigneeId],
                )
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NotificationsDropdown
              notifications={notifications}
              isOpen={isNotificationsOpen}
              onToggle={() => setIsNotificationsOpen((prev) => !prev)}
              onMarkAsRead={(notificationId) => {
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n,
                  ),
                )
              }}
              onClearAll={() => setNotifications([])}
            />
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
          </div>
        </header>

        {isError && (
          <p className="mb-4 text-sm text-destructive">
            An error occurred while loading tasks. Please check the API URL or network.
          </p>
        )}

        <div className="overflow-x-auto pb-2">
          <section className="flex min-w-max gap-8 sm:gap-10 lg:gap-12 xl:gap-16">
            <TaskColumn
              title="To Do"
              columnId="todo"
              tasks={filteredTodoTasks}
              isLoading={isLoading}
              authorInitial={authorInitial}
              getAssigneeInitials={getAssigneeInitials}
              onTaskClick={setOpenedTaskId}
              onTaskEdit={setEditingTaskId}
              onTaskDelete={setDeletingTaskId}
              onTaskDragStart={handleTaskDragStart}
              onCardDrop={handleCardDrop}
              onColumnDrop={handleColumnDrop}
              onDragOver={handleDragOver}
            />
            <TaskColumn
              title="In Progress"
              columnId="in_progress"
              tasks={filteredInProgressTasks}
              isLoading={isLoading}
              authorInitial={authorInitial}
              getAssigneeInitials={getAssigneeInitials}
              onTaskClick={setOpenedTaskId}
              onTaskEdit={setEditingTaskId}
              onTaskDelete={setDeletingTaskId}
              onTaskDragStart={handleTaskDragStart}
              onCardDrop={handleCardDrop}
              onColumnDrop={handleColumnDrop}
              onDragOver={handleDragOver}
            />
            <TaskColumn
              title="Blocked"
              columnId="blocked"
              tasks={filteredBlockedTasks}
              isLoading={isLoading}
              authorInitial={authorInitial}
              getAssigneeInitials={getAssigneeInitials}
              onTaskClick={setOpenedTaskId}
              onTaskEdit={setEditingTaskId}
              onTaskDelete={setDeletingTaskId}
              onTaskDragStart={handleTaskDragStart}
              onCardDrop={handleCardDrop}
              onColumnDrop={handleColumnDrop}
              onDragOver={handleDragOver}
            />
            <TaskColumn
              title="Review"
              columnId="review"
              tasks={filteredReviewTasks}
              isLoading={isLoading}
              authorInitial={authorInitial}
              getAssigneeInitials={getAssigneeInitials}
              onTaskClick={setOpenedTaskId}
              onTaskEdit={setEditingTaskId}
              onTaskDelete={setDeletingTaskId}
              onTaskApprove={setApprovingTaskId}
              onTaskDragStart={handleTaskDragStart}
              onCardDrop={handleCardDrop}
              onColumnDrop={handleColumnDrop}
              onDragOver={handleDragOver}
              reviewerId={filteredReviewTasks.find((t) => t.reviewerId)?.reviewerId}
              currentUserId={uid}
            />
            <TaskColumn
              title="Rejected"
              columnId="rejected"
              tasks={filteredRejectedTasks}
              isLoading={isLoading}
              authorInitial={authorInitial}
              getAssigneeInitials={getAssigneeInitials}
              onTaskClick={setOpenedTaskId}
              onTaskEdit={setEditingTaskId}
              onTaskDelete={setDeletingTaskId}
              onTaskDragStart={handleTaskDragStart}
              onCardDrop={handleCardDrop}
              onColumnDrop={handleColumnDrop}
              onDragOver={handleDragOver}
            />
            <TaskColumn
              title="Completed"
              columnId="completed"
              tasks={filteredCompletedTasks}
              isLoading={isLoading}
              authorInitial={authorInitial}
              getAssigneeInitials={getAssigneeInitials}
              onTaskClick={setOpenedTaskId}
              onTaskEdit={setEditingTaskId}
              onTaskDelete={setDeletingTaskId}
              onTaskDragStart={handleTaskDragStart}
              onCardDrop={handleCardDrop}
              onColumnDrop={handleColumnDrop}
              onDragOver={handleDragOver}
            />
          </section>
        </div>
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
      <NewTaskModal
        open={editingTaskId !== null}
        assignees={assignees}
        onClose={() => setEditingTaskId(null)}
        onSubmit={(values) => {
          handleUpdateTask(values)
          setEditingTaskId(null)
        }}
        initialValues={
          editingTaskId
            ? (() => {
                const allTasks = [
                  ...todoTasks,
                  ...inProgressTasks,
                  ...reviewTasks,
                  ...completedTasks,
                ]
                const current = allTasks.find((task) => task.id === editingTaskId)
                if (!current) {
                  return {
                    title: "",
                    description: "",
                    dueDate: "",
                    assigneeId: currentAssignee.id,
                    assigneeIds: [currentAssignee.id],
                    priority: "medium" as PriorityValue,
                  }
                }

                const fallbackAssigneeId =
                  assignees.find(
                    (assignee) =>
                      assignee.name
                        .trim()
                        .charAt(0)
                        .toUpperCase() ===
                      (current.assigneeInitial ?? authorInitial),
                  )?.id ?? currentAssignee.id

                return {
                  title: current.title ?? "",
                  description: current.description ?? "",
                  dueDate: current.dueDate ?? "",
                  assigneeId: current.assigneeId ?? fallbackAssigneeId,
                  assigneeIds: current.assigneeIds ?? [current.assigneeId ?? fallbackAssigneeId],
                  priority: current.priority ?? "medium",
                }
              })()
            : undefined
        }
        mode="edit"
      />
      <TaskDetailsModal
        open={openedTaskId !== null}
        taskId={openedTaskId}
        titleOverride={
          openedTaskId
            ? allTasks.find((task) => task.id === openedTaskId)?.title
            : undefined
        }
        descriptionOverride={
          openedTaskId
            ? allTasks.find((task) => task.id === openedTaskId)?.description
            : undefined
        }
        dueDateOverride={
          openedTaskId
            ? allTasks.find((task) => task.id === openedTaskId)?.dueDate
            : undefined
        }
        priorityOverride={
          openedTaskId
            ? allTasks.find((task) => task.id === openedTaskId)?.priority
            : undefined
        }
        statusOverride={
          openedTaskId
            ? (() => {
                const found = allTasksWithColumn.find(
                  (item) => item.task.id === openedTaskId,
                )
                if (!found) return undefined
                return found.column === "completed" ? "completed" : found.column
              })()
            : undefined
        }
        createdByOverride={
          openedTaskId
            ? allTasks.find((task) => task.id === openedTaskId)?.createdByName ??
              currentAssignee.name
            : undefined
        }
        assigneeOverride={
          openedTaskId
            ? allTasks.find((task) => task.id === openedTaskId)?.assigneeName ??
              currentAssignee.name
            : undefined
        }
        closedAtOverride={
          openedTaskId
            ? allTasks.find((task) => task.id === openedTaskId)?.closedAt
            : undefined
        }
        assigneesOverride={
          openedTaskId
            ? (() => {
                const task = allTasks.find((item) => item.id === openedTaskId)
                return task ? getAssigneeNames(task) : undefined
              })()
            : undefined
        }
        reviewerOverride={
          openedTaskId
            ? allTasks.find((task) => task.id === openedTaskId)?.reviewerName
            : undefined
        }
        onClose={() => setOpenedTaskId(null)}
      />
      <ReviewerSelectionModal
        open={reviewingTaskId !== null}
        reviewingTaskId={reviewingTaskId}
        previousReviewColumn={previousReviewColumn}
        selectedReviewerId={selectedReviewerId}
        availableReviewers={getAvailableReviewersForTask(reviewingTaskId)}
        onSelectReviewer={setSelectedReviewerId}
        onCancel={() => {
          setReviewingTaskId(null)
          setPreviousReviewColumn(null)
          setSelectedReviewerId("")
        }}
        onConfirm={handleConfirmReviewer}
        onMoveTaskBack={(taskId, fromColumn, toColumn) => {
          setBoard((prev) => {
            if (!prev) return prev
            const toIndex = prev[toColumn].length
            return moveTaskInBoard(prev, {
              fromColumn,
              toColumn,
              taskId,
              toIndex,
            })
          })
        }}
      />
      <BlockedByModal
        open={blockingTaskId !== null}
        taskTitle={
          blockingTaskId
            ? allTasks.find((task) => task.id === blockingTaskId)?.title
            : undefined
        }
        blockingTaskId={blockingTaskId}
        selectedBlockingTaskId={selectedBlockingTaskId}
        options={getBlockingTaskOptions(blockingTaskId)}
        onSelect={setSelectedBlockingTaskId}
        onCancel={() => {
          setBlockingTaskId(null)
          setPreviousBlockedColumn(null)
          setSelectedBlockingTaskId("")
        }}
        onConfirm={handleConfirmBlockedBy}
        onMoveBack={() => {
          if (!blockingTaskId || !previousBlockedColumn) return
          setBoard((prev) => {
            if (!prev) return prev
            const toIndex = prev[previousBlockedColumn].length
            return moveTaskInBoard(prev, {
              fromColumn: "blocked",
              toColumn: previousBlockedColumn,
              taskId: blockingTaskId,
              toIndex,
            })
          })
        }}
      />
      <ConfirmModal
        open={deletingTaskId !== null}
        title="Delete task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeletingTaskId(null)}
        onConfirm={() => {
          if (!deletingTaskId) return
          setBoard((prev) => {
            if (!prev) return prev
            const next: BoardState = (Object.keys(prev) as ColumnId[]).reduce(
              (acc, column) => {
                acc[column] = prev[column].filter(
                  (task) => task.id !== deletingTaskId,
                )
                return acc
              },
              {} as BoardState,
            )
            return next
          })
          setDeletingTaskId(null)
          setEditingTaskId(null)
        }}
      />
      <ConfirmModal
        open={approvingTaskId !== null}
        title="Approve task"
        description="Are you sure you want to approve this task? A notification will be sent about successful review."
        confirmLabel="Approve"
        cancelLabel="Cancel"
        variant="default"
        onCancel={() => setApprovingTaskId(null)}
        onConfirm={handleApproveTask}
      />
    </div>
  )
}
