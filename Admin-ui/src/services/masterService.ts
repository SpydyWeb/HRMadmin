// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { IAgentCategoryResponse } from '@/models/master'


export const masterService = {
  getmasters: () =>
    callApi<ApiResponse<IAgentCategoryResponse>>(APIRoutes.GETMASTERS, [])

    // return response.responseBody?.agents?.[0] || null
}
