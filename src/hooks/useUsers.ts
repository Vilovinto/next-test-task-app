"use client"

import { useQuery } from "@tanstack/react-query"
import { collection, getDocs, type DocumentData } from "firebase/firestore"

import { firebaseDb } from "@/lib/firebase"

export type AppUser = {
  id: string
  displayName: string
  email: string
}

async function fetchUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(collection(firebaseDb, "users"))

  return snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData
    return {
      id: doc.id,
      displayName: (data.displayName as string) ?? "",
      email: (data.email as string) ?? "",
    }
  })
}

export function useUsers() {
  return useQuery<AppUser[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })
}


