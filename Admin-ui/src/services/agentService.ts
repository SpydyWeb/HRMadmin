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
import { channel } from 'diagnostics_channel'

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
    if (response?.responseBody) {
     
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
  fetchGeoHierarchyTable:async (channelCategory:string, designationCode:string)=>{
    const response = await callApi<ApiResponse<any>>(
      APIRoutes.GEO_HIERARCHY_TABLE,
      [channelCategory, designationCode],
    )
    
    
    // Handle different response structures
    const responseBody = (response as any)?.responseBody
    const directResponse = response as any
    
    if (responseBody?.geoAgentHierarchy) {
      // console.log("✅ Found geoAgentHierarchy in response.responseBody")
      return responseBody.geoAgentHierarchy
    }
    
    // Check if geoAgentHierarchy is directly in response
    if (directResponse?.geoAgentHierarchy) {
      // console.log("✅ Found geoAgentHierarchy directly in response")
      return directResponse.geoAgentHierarchy
    }
    
    // Check if responseBody itself is the array
    if (Array.isArray(responseBody)) {
      // console.log("✅ responseBody is directly an array")
      return responseBody
    }
    
    // Check if response itself is the array
    if (Array.isArray(response)) {
      // console.log("✅ response is directly an array")
      return response
    }
    
    console.warn("⚠️ Could not find geoAgentHierarchy in response structure")
    return null
  },
}
