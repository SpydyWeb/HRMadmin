// src/services/authService.ts
import { callApi } from './apiService'
import type {
  ILoginRequest,
  ILoginResponseBody,
} from '@/models/authentication'
import type { ApiResponse } from '@/models/api'

export const authService = {
  login: (data: ILoginRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>('login', [data]),
}
