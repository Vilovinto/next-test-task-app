"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"

import { firebaseAuth } from "@/lib/firebase"

type FirebaseUserState = {
  user: User | null
  loading: boolean
}

export function useFirebaseUser(): FirebaseUserState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, loading }
}


