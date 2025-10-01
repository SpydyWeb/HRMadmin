// src/services/authService.ts
import { callApi } from './apiService'
import type { ILoginResponseBody } from '@/models/authentication'
import type { ApiResponse } from '@/models/api'
import type {
  IAgentSearchByCodeRequest,
  IAgentSearchRequest,
} from '@/models/agent'

export const agentService = {
  search: (data: IAgentSearchRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>("search", [data]),
  searchbycode: (data: IAgentSearchByCodeRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>("searchbycode", [data]),
}
