"use client"

import { useMutation } from "@tanstack/react-query"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  type DocumentData,
} from "firebase/firestore"

import { firebaseAuth, firebaseDb } from "@/lib/firebase"

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  username?: string
}

type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

export function useGoogleLogin() {
  return useMutation<LoginResponse, Error, void>({
    mutationKey: ["auth", "login", "google"],
    mutationFn: async () => {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })

      const credential = await signInWithPopup(firebaseAuth, provider)
      const user = credential.user
      const token = await user.getIdToken()

      const [firstName = "", ...rest] = (user.displayName ?? "").split(" ")
      const lastName = rest.join(" ")

      if (user.uid) {
        const emailLocal =
          (user.email ?? "").includes("@")
            ? (user.email ?? "").split("@")[0]
            : ""
        await setDoc(
          doc(firebaseDb, "users", user.uid),
          {
            displayName: user.displayName ?? "",
            email: user.email ?? "",
            ...(emailLocal ? { username: emailLocal } : {}),
          },
          { merge: true },
        )
      }

      return {
        token,
        user: {
          id: user.uid,
          email: user.email ?? "",
          firstName,
          lastName,
        },
      }
    },
  })
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationKey: ["auth", "login"],
    mutationFn: async ({ email, password }) => {
      let loginEmail = email

      // If user typed a username (no '@'), try to resolve it to an email via Firestore
      if (!email.includes("@")) {
        const usersRef = collection(firebaseDb, "users")
        const q = query(usersRef, where("username", "==", email), limit(1))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as DocumentData
          loginEmail = (data.email as string) ?? loginEmail
        }
      }

      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        loginEmail,
        password,
      )
      const user = credential.user
      const token = await user.getIdToken()

      const [firstName = "", ...rest] = (user.displayName ?? "").split(" ")
      const lastName = rest.join(" ")

      if (user.uid) {
        await setDoc(
          doc(firebaseDb, "users", user.uid),
          {
            displayName: user.displayName ?? "",
            email: user.email ?? "",
          },
          { merge: true },
        )
      }

      return {
        token,
        user: {
          id: user.uid,
          email: user.email ?? "",
          firstName,
          lastName,
        },
      }
    },
  })
}

export function useRegister() {
  return useMutation<LoginResponse, Error, RegisterPayload>({
    mutationKey: ["auth", "register"],
    mutationFn: async ({ firstName, lastName, email, password, username }) => {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      )

      if (credential.user) {
        await updateProfile(credential.user, {
          displayName: `${firstName} ${lastName}`,
        })
      }

      const user = credential.user
      const token = await user.getIdToken()

      const usernameToSave =
        username?.trim() ||
        ((email ?? "").includes("@") ? email.split("@")[0] : "")

      if (user.uid) {
        await setDoc(
          doc(firebaseDb, "users", user.uid),
          {
            displayName: `${firstName} ${lastName}`,
            email: user.email ?? "",
            ...(usernameToSave ? { username: usernameToSave } : {}),
          },
          { merge: true },
        )
      }

      return {
        token,
        user: {
          id: user.uid,
          email: user.email ?? "",
          firstName,
          lastName,
        },
      }
    },
  })
}

