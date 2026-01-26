// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ILoginResponseBody } from '@/models/authentication'
import type { ApiResponse } from '@/models/api'
import type {
  IAgentSearchByCodeRequest,
  IAgentSearchRequest,
  IAgent,
  IEditAgentRequest,
  IEditAgentResponseBody,
} from '@/models/agent'

export const agentService = {
  search: (data: IAgentSearchRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.SEARCH, [data]),
  searchbycode: (data: IAgentSearchByCodeRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.SEARCHBYCODE, [data]),
  AgentByCode: (data: IAgentSearchByCodeRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.AGENTBYCODE, [data]),

  editAgent: async (
    data: IEditAgentRequest,
    sectionName: string,
    agentid: number,
  ) => {
    console.log('EDIT_AGENT route:', APIRoutes.EDIT_AGENT)
    console.log('EDIT_AGENT data:', data)
     console.log('🔍 Agent ID:', agentid)
        console.log('🔍 Section Name:', sectionName)
    try {
      const response = await callApi<ApiResponse<IEditAgentResponseBody>>(
        APIRoutes.EDIT_AGENT,
        [data, sectionName, agentid],
      )
      if (!response) {
        console.warn('agent edit- Response is undefined or null')
      }
      console.log('EDIT_AGENT full response:', response)
      console.log('EDIT_AGENT responseBody:', response?.responseBody)

      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  fetchAgentHierarchy: async (data: IAgentSearchByCodeRequest) => {
    const response = await callApi<ApiResponse<ILoginResponseBody>>(
      APIRoutes.AGENTBYID,
      [data],
    )
    console.log('agent', response)
    return response.responseBody?.agents?.[0] || null
  },
}
