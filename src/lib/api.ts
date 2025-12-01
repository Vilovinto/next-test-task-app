const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "").replace(/\/todos$/, "")

export type TaskStatus = "todo" | "in_progress" | "done"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: "low" | "medium" | "high"
  dueDate?: string
}

type JsonPlaceholderTodo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${input}`

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    }
  })

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw new Error(message || `Request failed with status ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function fetchTasks(): Promise<Task[]> {
  const todos = await request<JsonPlaceholderTodo[]>("/todos")

  return todos.map((todo) => ({
    id: String(todo.id),
    title: todo.title,
    description: undefined,
    status: todo.completed ? "done" : "todo",
    priority: "medium",
    dueDate: undefined,
  }))
}

export async function fetchTask(id: string): Promise<Task> {
  const todo = await request<JsonPlaceholderTodo>(`/todos/${id}`)

  return {
    id: String(todo.id),
    title: todo.title,
    description: undefined,
    status: todo.completed ? "done" : "todo",
    priority: "medium",
    dueDate: undefined,
  }
}

