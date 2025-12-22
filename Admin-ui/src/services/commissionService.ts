// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { ICommissionMgmtResponseBody, ICommissionMgmtApiResponse,IProcessCommissionResponseBody,IHoldCommissionResponseBody,IAdjustCommissionResponseBody,IApproveCommissionResponseBody} from '@/models/commission'

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
  processCommission: async (data:IProcessCommissionResponseBody) => {
    try {
      const response = await callApi<ApiResponse<ICommissionMgmtApiResponse>>(
        APIRoutes.PROCESSCOMMISSION,
        [data],
      )
      return response     
    } catch (error) {
      
    }
  },
  holdCommission: async (data:IHoldCommissionResponseBody) => {
    try {
      const response = await callApi<ApiResponse<ICommissionMgmtApiResponse>>(
        APIRoutes.HOLDCOMMISSION,
        [data],
      )
      return response     
    } catch (error) {
      
    }
  },
  adjustCommission: async (data:IAdjustCommissionResponseBody) => {
    try {
      const response = await callApi<ApiResponse<ICommissionMgmtApiResponse>>(
        APIRoutes.ADJUSTCOMMISSION,
        [data],
      )
      return response     
    } catch (error) {
      
    }
  },
  approveCommission: async (data:IApproveCommissionResponseBody) => {
    try {
      const response = await callApi<ApiResponse<ICommissionMgmtApiResponse>>(
        APIRoutes.APPROVECOMMISSION,
        [data],
      )
      return response     
    } catch (error) {
      
    }
  }

}
