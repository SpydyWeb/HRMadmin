// src/services/authService.ts
import { APIRoutes } from './constant'
import { apiClient } from './apiClient'
import type { ILoginResponseBody } from '@/models/authentication'
import type { ApiResponse } from '@/models/api'
import type {
  IAgentSearchByCodeRequest,
  IAgentSearchRequest,
} from '@/models/agent'

export const agentService = {
  search: (data: IAgentSearchRequest) =>
    apiClient.post<ApiResponse<ILoginResponseBody>>(APIRoutes.AGENTSEARCH, data),
  searchbycode: (data: IAgentSearchByCodeRequest) =>
    apiClient.post<ApiResponse<ILoginResponseBody>>(`${APIRoutes.AGENTBYCODE}`, data),
}
