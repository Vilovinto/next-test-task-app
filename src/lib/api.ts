import { collection, doc, getDoc, getDocs, type DocumentData } from "firebase/firestore"

import { firebaseDb } from "@/lib/firebase"

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "blocked"
  | "rejected"
  | "done"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: "low" | "medium" | "high"
  dueDate?: string
}

export async function fetchTasks(): Promise<Task[]> {
  const snapshot = await getDocs(collection(firebaseDb, "tasks"))

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data() as DocumentData

    const statusValue = (data.status as TaskStatus) ?? "todo"
    const priorityValue = (data.priority as Task["priority"]) ?? "medium"

    return {
      id: docSnapshot.id,
      title: (data.title as string) ?? "Untitled task",
      description: (data.description as string) ?? "",
      status: statusValue,
      priority: priorityValue,
      dueDate:
        typeof data.dueDate === "string" && data.dueDate.trim().length > 0
          ? data.dueDate
          : undefined,
    }
  })
}

export async function fetchTask(id: string): Promise<Task> {
  const ref = doc(firebaseDb, "tasks", id)
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) {
    throw new Error("Task not found")
  }

  const data = snapshot.data() as DocumentData

  const statusValue = (data.status as TaskStatus) ?? "todo"
  const priorityValue = (data.priority as Task["priority"]) ?? "medium"

  return {
    id: snapshot.id,
    title: (data.title as string) ?? "Untitled task",
    description: (data.description as string) ?? "",
    status: statusValue,
    priority: priorityValue,
    dueDate:
      typeof data.dueDate === "string" && data.dueDate.trim().length > 0
        ? data.dueDate
        : undefined,
  }
}

