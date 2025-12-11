// // src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { IAgentCategoryResponse, IMasterRequest } from '@/models/master'

// export const masterService = {
//   getmasters: (data:IMasterRequest) =>
//     callApi<ApiResponse<IAgentCategoryResponse>>(APIRoutes.GETMASTERS, [data])
// }

export const masterService = {
  getmasters: async (data: IMasterRequest) => {
    try {
      const response = await callApi<ApiResponse<IAgentCategoryResponse>>(
        APIRoutes.GETMASTERS,
        [data],
      )
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  getMastersBulk: async (keys: string[]) => {
    const response = await callApi<Record<string, any[]>>('GetMastersBulk', [
      keys,
    ])
    return response
  },
}
