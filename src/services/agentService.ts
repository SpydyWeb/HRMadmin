// src/services/authService.ts
import { APIRoutes } from './constant'
import { apiClient } from './apiClient'
import type { LoginResponseBody } from '@/models/authentication'
import type { ApiResponse } from '@/models/api'
import type { Agent, AgentSearchByCodeRequest, AgentSearchRequest } from '@/models/agent'

export const agentService = {
  search: (data: AgentSearchRequest) =>
    apiClient.post<ApiResponse<LoginResponseBody>>(APIRoutes.AGENTSEARCH, data),
    searchbycode: (data: AgentSearchByCodeRequest) =>
    apiClient.post<Agent[]>(`${APIRoutes.AGENTSEARCH}?AgentCode=${data.AgentCode}`),
}
