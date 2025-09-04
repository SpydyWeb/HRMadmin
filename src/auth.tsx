// src/auth.ts
import type {
  LoginRequest,
  ApiResponse,
  LoginResponseBody,
} from './models/authentication'
import { authService } from './services/authService' 
import { storage, TOKEN_KEY } from '@/utils/storage'

let _token: string | null = null

export const auth = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    _token = storage.get(TOKEN_KEY) // refresh-safe
    return _token
  },


 isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && payload.exp < Date.now() / 1000) {
        this.logout()
        return false
      }
      return true
    } catch {
      this.logout()
      return false
    }
  },
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponseBody>> {
    const res = await authService.login(data)
    const token = res.responseBody.loginResponse?.token
    if (token) {
      _token = token
      storage.set(TOKEN_KEY, token)
    }
    return res
  },

  /** Decode current token payload */
  getCurrentUser(): any | null {
    const token = this.getToken()
    if (!token) return null
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch {
      return null
    }
  },

  /** Clear token */
  logout(): void {
    _token = null
    if (typeof window !== 'undefined') {
      storage.remove(TOKEN_KEY)
    }
  },
}
