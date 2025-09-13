import type { Agent } from "./agent"

// src/models/authentication.ts
export interface LoginRequest {
  username: string
  password: string
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
  agents: Agent[]
}
