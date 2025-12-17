// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { ICommissionMgmtResponseBody, ICommissionMgmtApiResponse} from '@/models/commission'

export const commissionService = {
  commissionDashboard: async (data:ICommissionMgmtResponseBody) => {
    try{
    const response = await callApi<ApiResponse<ICommissionMgmtApiResponse>>(
      APIRoutes.GETCOMMISSIONDATA,
      [data],
    )
    return response
  }catch(error){
    console.error(error)
    throw error
  }
  },
}
