export const AUTH_TOKEN_KEY = "auth_token"

export function saveAuthToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}


