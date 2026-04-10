import { TOKEN_KEY } from './services/constant'
import { authService } from './services/authService'
import {
  ApiResponse,
  ILoginRequest,
  ILoginResponseBody,
} from '@/models/authentication'
import { storage } from '@/utils/storage'
import { parseStoredAuth } from '@/utils/parseStoredAuth'
import { authStore } from '@/store/authStore'

let _token: string | null = null

export const auth = {
  getToken(): string | null {
    //return 'mytoken';
    if (typeof window === 'undefined') return null // SSR guard
    if (_token) return _token
    _token = storage.get(TOKEN_KEY)

    return _token
  },

  /** Update the in-memory token cache (called after token refresh). */
  setToken(token: string | null): void {
    _token = token
  },

  isAuthenticated(): boolean {
    //return true;
    const token = this.getToken()
    if (!token) return false

    const session = parseStoredAuth(token)
    if (!session?.token) return false

    try {
      const payload = JSON.parse(atob(session.token.split('.')[1]))
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
  async login(data: ILoginRequest): Promise<ApiResponse<ILoginResponseBody>> {
    const response = await authService.login(data)
    const loginResponse = response.responseBody.loginResponse
    const token = JSON.stringify(loginResponse)
    if (loginResponse?.token) {
      _token = token
      storage.set(TOKEN_KEY, token)
      authStore.setState({
        token: loginResponse.token,
        user: loginResponse,
      })
    }
    return response
  },
  logout(): void {
    _token = null
    if (typeof window !== 'undefined') {
      storage.remove(TOKEN_KEY)
      authStore.setState({ token: null, user: null })
      window.location.href = '/login'
    }
  },
}
