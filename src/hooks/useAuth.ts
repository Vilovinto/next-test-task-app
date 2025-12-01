"use client"

import { useMutation } from "@tanstack/react-query"
import {
  login,
  register,
  type LoginPayload,
  type LoginResponse,
  type RegisterPayload,
} from "@/lib/api"

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationKey: ["auth", "login"],
    mutationFn: (payload) => login(payload),
  })
}

export function useRegister() {
  return useMutation<LoginResponse, Error, RegisterPayload>({
    mutationKey: ["auth", "register"],
    mutationFn: (payload) => register(payload),
  })
}

