// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { IAgentCategoryResponse, IMasterRequest } from '@/models/master'


export const masterService = {
  getmasters: (data:IMasterRequest) =>
    callApi<ApiResponse<IAgentCategoryResponse>>(APIRoutes.GETMASTERS, [data])
}
