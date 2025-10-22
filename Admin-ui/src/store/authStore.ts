// src/stores/authStore.ts
import { Store } from '@tanstack/store'
import { storage } from '@/utils/storage'
import { TOKEN_KEY } from '@/services/constant'

export interface AuthState {
  token: string | null
  user: any | null
}

function getInitialState(): AuthState {
  // return {token:'mytoken', user: {name: 'Demo User'}}; // default for testing
  const saved = storage.get(TOKEN_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return {
        token: parsed.token,
        user: parsed, // adjust depending on your login response
      }
    } catch {
      return { token: null, user: null }
    }
  }
  return { token: null, user: null }
}

export const authStore = new Store<AuthState>(getInitialState())
