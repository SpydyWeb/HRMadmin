// src/hooks/useAuth.ts
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/store/authStore'

export function useAuth() {
  return useStore(authStore)
}
