import { LoginRequest, LoginResponse } from './models/authentication'
import { apiClient } from './services/apiClient'
import { APIRoutes } from './services/constant'

const TOKEN_KEY = ''

export const auth = {
  _token:
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,

  /** Check if user is authenticated */
  isAuthenticated(): boolean {
    const token = this._token
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      if (payload.exp && payload.exp < currentTime) {
        this.logout()
        return false
      }
      return true
    } catch {
      this.logout()
      return false
    }
  },

  /** Perform login and store token */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(APIRoutes.LOGIN, data)
    console.log('====================================')
    console.log(response)
    console.log('====================================')
    // if (response && response.token) {
    //   this._token = response.token;
    //   localStorage.setItem(TOKEN_KEY, response.token);
    // }
    return response
  },

  /** Logout and clear token */
  logout(): void {
    this._token = null
    localStorage.removeItem(TOKEN_KEY)
  },

  /** Get current user payload from token */
  getCurrentUser(): any | null {
    if (!this._token) return null
    try {
      return JSON.parse(atob(this._token.split('.')[1]))
    } catch {
      return null
    }
  },

  /** Get stored token */
  getToken(): string | null {
    return this._token
  },
}
