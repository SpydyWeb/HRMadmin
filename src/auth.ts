import {
  ApiResponse,
  LoginRequest,
  LoginResponseBody,
} from './models/authentication'
import { authService } from './services/authService'
import { TOKEN_KEY } from './services/constant'
import { storage } from '@/utils/storage'

let _token: string | null = null

export const auth = {
  getToken(): string | null {
    return 'mytoken';
    if (typeof window === 'undefined') return null // SSR guard
    if (_token) return _token
    _token = storage.get(TOKEN_KEY)
    return _token
  },

  isAuthenticated(): boolean {
    return true;
    if (typeof window === 'undefined') return false // SSR guard
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      if (payload.exp && payload.exp < now) {
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
    const response = await authService.login(data)
    const token = response.responseBody.loginResponse?.token
    if (token) {
      _token = token
      storage.set(TOKEN_KEY, JSON.stringify(response.responseBody.loginResponse))
    }
    return response
  },
  logout(): void {
    _token = null
    if (typeof window !== 'undefined') {
      storage.remove(TOKEN_KEY)
    }
  },
}
