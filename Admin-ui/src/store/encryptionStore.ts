import { Store } from '@tanstack/store'
import { STORAGE_KEY } from '@/utils/constant'

interface EncryptionState {
  enabledAPIEncryption: boolean
}



// Load saved state from localStorage (if browser)
const loadInitialState = (): EncryptionState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      return { enabledAPIEncryption: saved === 'true' }
    }
  }
  return { enabledAPIEncryption: false }
}

// Create store with persistent initial state
export const encryptionStore = new Store<EncryptionState>(loadInitialState())

// Helper: update store + persist to localStorage
export const setEncryption = (enabledAPIEncryption: boolean) => {
  encryptionStore.setState({ enabledAPIEncryption })
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(enabledAPIEncryption))
  }
}

// Getter: read current state
export const useEncryption = () => encryptionStore.state.enabledAPIEncryption
