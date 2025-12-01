"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTask, fetchTasks, type Task } from "@/lib/api"

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  })
}

export function useTask(id: string | undefined) {
  return useQuery<Task | undefined>({
    queryKey: ["tasks", id],
    queryFn: () => (id ? fetchTask(id) : Promise.resolve(undefined)),
    enabled: !!id,
  })
}


