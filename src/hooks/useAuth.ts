"use client"

import { useMutation } from "@tanstack/react-query"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"

import { firebaseAuth } from "@/lib/firebase"

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
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
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      const user = credential.user
      const token = await user.getIdToken()

      const [firstName = "", ...rest] = (user.displayName ?? "").split(" ")
      const lastName = rest.join(" ")

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
    mutationFn: async ({ firstName, lastName, email, password }) => {
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

