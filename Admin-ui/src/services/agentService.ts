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
    // console.log('EDIT_AGENT route:', APIRoutes.EDIT_AGENT)
    // console.log('EDIT_AGENT data:', data)
    //  console.log('🔍 Agent ID:', agentid)
    //     console.log('🔍 Section Name:', sectionName)
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

  fetchGeoHierarchy: async (channelCategory: string) => {
    const response = await callApi<ApiResponse<any>>(
      APIRoutes.GEO_HIERARCHY,
      [channelCategory],
    )
    // console.log('geoHierarchy full response:', response)
    // console.log('geoHierarchy responseBody:', response?.responseBody)
    
    // Handle different possible response structures
    if (response?.responseBody) {
      // Case 1: peopleHeirarchy is directly in responseBody
      if (response.responseBody.geoHierarchy) {
        return response.responseBody
      }
      // Case 2: peopleHeirarchy is nested in agents[0]
      if (response.responseBody.agents?.[0]?.geoHierarchy) {
        return response.responseBody.agents[0]
      }
      // Case 3: responseBody itself is the object we need
      return response.responseBody
    }
    return null
  },
}
