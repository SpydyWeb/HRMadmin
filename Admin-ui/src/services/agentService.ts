// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ILoginResponseBody } from '@/models/authentication'
import type { ApiResponse } from '@/models/api'
import type {
  IAgentSearchByCodeRequest,
  IAgentSearchRequest,
} from '@/models/agent'

export const agentService = {
  search: (data: IAgentSearchRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.SEARCH, [data]),
  searchbycode: (data: IAgentSearchByCodeRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.SEARCHBYCODE, [data]),
<<<<<<< HEAD
    AgentByCode: (data: IAgentSearchByCodeRequest) =>
=======
  AgentByCode: (data: IAgentSearchByCodeRequest) =>
>>>>>>> uat
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.AGENTBYCODE, [data]),
  fetchAgentHierarchy: async (data: IAgentSearchByCodeRequest) => {
    const response = await callApi<ApiResponse<ILoginResponseBody>>(
      APIRoutes.AGENTBYID,
      [data],
    )
    return response.responseBody?.agents?.[0] || null
  },
}
