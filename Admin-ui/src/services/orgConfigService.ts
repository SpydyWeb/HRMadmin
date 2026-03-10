import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type {
  IOrgConfigRequest,
  IOrgConfigResponseBody,
} from '@/models/orgconfig'

export const OrgConfigService = {
  fetchOrgConfig: async (data?: IOrgConfigRequest) => {
    try {
      // Pass empty object if no data provided, or the provided data
      const requestData = data || {}
      const response = await callApi<ApiResponse<IOrgConfigResponseBody>>(
        APIRoutes.ORG_CONFIG,
        [requestData],
      )
      console.log('org config response', response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  updateOrgConfig: async (data?: IOrgConfigRequest) => {
    try {
      
      const requestData = data || {}
      const response = await callApi<ApiResponse<IOrgConfigResponseBody>>(
        APIRoutes.ORG_CONFIG_UPDATE,
        [requestData],
      )
      console.log('org config section update response', response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },
}