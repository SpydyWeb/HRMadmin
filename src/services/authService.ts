// src/services/authService.ts
import { apiClient } from './apiClient'
import { APIRoutes } from './constant'
import type { LoginRequest,  LoginResponseBody } from '@/models/authentication'
import type { ApiResponse } from '@/models/api'

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponseBody>>(APIRoutes.LOGIN, data),
}
