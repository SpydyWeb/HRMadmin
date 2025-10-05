// src/store/encryptionStore.ts
import { Store } from '@tanstack/store'

interface EncryptionState {
  enabledAPIEncryption: boolean
}

export const encryptionStore = new Store<EncryptionState>({
  enabledAPIEncryption: true, // default ON
})

// helpers
export const setEncryption = (enabledAPIEncryption: boolean) => {
  encryptionStore.setState({ enabledAPIEncryption })
}
export const useEncryption = () => encryptionStore.state.enabledAPIEncryption
