// src/services/authService.ts
import { apiClient } from './apiClient'
import { APIRoutes } from './constant'
import type { ILoginRequest,  ILoginResponseBody } from '@/models/authentication'
import type { ApiResponse } from '@/models/api'

export const authService = {
  login: (data: ILoginRequest) =>
    apiClient.post<ApiResponse<ILoginResponseBody>>(APIRoutes.LOGIN, data),
}
