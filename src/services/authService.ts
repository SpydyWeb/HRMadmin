// src/services/authService.ts
import { apiClient } from './apiClient'
import { APIRoutes } from './constant'
import type { LoginRequest, ApiResponse, LoginResponseBody } from '@/models/authentication'

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponseBody>>(APIRoutes.LOGIN, data),
}
