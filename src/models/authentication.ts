// src/models/authentication.ts
export interface LoginRequest {
  username: string
  password: string
}

export interface ApiResponse<T> {
  responseHeader: {
    errorCode: number
    errorMessage: string
  }
  responseBody: T
}

export interface LoginResponseBody {
  loginResponse: {
    token: string
    expiration: string
    userId: number
    username: string
    role: string | null
  } | null
  hmsDashboard: any
  agents: any
}
