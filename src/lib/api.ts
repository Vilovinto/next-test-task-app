const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.tasks.white-digital.com"

export type TaskStatus = "todo" | "in_progress" | "done"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: "low" | "medium" | "high"
  dueDate?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name?: string
  }
}

export interface RegisterPayload {
  email: string
  password: string
  name?: string
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
  return request<Task[]>("/tasks")
}

export async function fetchTask(id: string): Promise<Task> {
  return request<Task>(`/tasks/${id}`)
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}


