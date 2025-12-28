// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { ICommissionMgmtResponseBody, ICommissionMgmtApiResponse,IProcessCommissionResponseBody,IHoldCommissionResponseBody,IAdjustCommissionResponseBody,IApproveCommissionResponseBody,IConfigCommissionResponseBody, IConfigCommissionRequest} from '@/models/commission'

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
  },
  configCommission: async (data:IConfigCommissionRequest) => {
    try {
      const response = await callApi<ApiResponse<IConfigCommissionResponseBody>>(
        APIRoutes.CONFIG_COMMISSION,
        [data],
      )
      console.log("config 1st step service response:", response);
      return response     
    } catch (error) {
      console.error("configCommission service error:", error);
      throw error;
    }
  },
  updateConditionCommissionConfig: async (data: { commissionConfigId: number; condition: string }) => {
    try {
      //  console.log("Making API call to update condition:", data);
      const response = await callApi<ApiResponse<ICommissionMgmtApiResponse>>(
        APIRoutes.UPDATE_CONDITION_CONFIG,
        [data],
      )
      // console.log("API response received:", response);
    if (!response) {
      throw new Error("Invalid response structure");
    }
      return response     
    } catch (error) {
      
    }
  },

}
