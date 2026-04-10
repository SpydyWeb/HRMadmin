// src/stores/authStore.ts
import { Store } from '@tanstack/store'
import { storage } from '@/utils/storage'
import { TOKEN_KEY } from '@/services/constant'
import { parseStoredAuth } from '@/utils/parseStoredAuth'

export interface AuthState {
  token: string | null
  user: any | null
}

function getInitialState(): AuthState {
  // return {token:'mytoken', user: {name: 'Demo User'}}; // default for testing
  const saved = storage.get(TOKEN_KEY)
  if (saved) {
    const session = parseStoredAuth(saved)
    if (!session) return { token: null, user: null }
    if (saved.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>
        return {
          token: session.token,
          user: parsed,
        }
      } catch {
        return { token: session.token, user: null }
      }
    }
    return { token: session.token, user: null }
  }
  return { token: null, user: null }
}

export const authStore = new Store<AuthState>(getInitialState())
