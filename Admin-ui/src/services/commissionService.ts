// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { ICommissionMgmtResponseBody, ICommissionMgmtApiResponse,IProcessCommissionResponseBody,IHoldCommissionResponseBody,IAdjustCommissionResponseBody,IApproveCommissionResponseBody,IConfigCommissionResponseBody, IConfigCommissionRequest, IUpdateCronRequest, IUpdateStatusRequest, ICommissionSearchFieldsRequest, IExecutiveHistoryRequest, IExecutiveHistoryResponseBody, ICommissionSearchFieldsResponseBody} from '@/models/commission'

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
      console.log("configCommission request payload:", data);
      const response = await callApi<ApiResponse<IConfigCommissionResponseBody>>(
        APIRoutes.CONFIG_COMMISSION,
        [data],
      )
      console.log("config 1st step service response:", response);
      console.log("configCommission response type:", typeof response);
      console.log("configCommission response keys:", response ? Object.keys(response) : 'null/undefined');
      
      // Validate response structure
      if (!response || typeof response !== 'object' || Object.keys(response).length === 0) {
        console.error("Invalid response received:", response);
        throw new Error('Invalid or empty response from API. Please check the server logs.');
      }
      
      if (!response.responseHeader) {
        console.error("Response missing responseHeader:", JSON.stringify(response, null, 2));
        throw new Error('API response is missing required responseHeader field.');
      }
      
      return response     
    } catch (error) {
      console.error("configCommission service error:", error);
      console.error("Error details:", {
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        response: (error as any)?.response
      });
      throw error;
    }
  },
  updateCron: async (data:IUpdateCronRequest) => {
    try {
      const response = await callApi<ApiResponse<IConfigCommissionResponseBody>>(
        APIRoutes.UPDATE_CRON,
        [data],
      )
      console.log("config cron response:", response);
      return response     
    } catch (error) {
      console.error("cron error:", error);
      throw error;
    }
  },
  updateConditionCommissionConfig: async (data: { commissionConfigId: number; condition: string }) => {
    try {
      const response = await callApi<ApiResponse<ICommissionMgmtApiResponse>>(
        APIRoutes.UPDATE_CONDITION_CONFIG,
        [data],
      )
    if (!response) {
      throw new Error("Invalid response structure");
    }
      return response     
    } catch (error) {
      
    }
  },
  configCommissionList: async (data:IConfigCommissionRequest) => {
    try {
    
      const response = await callApi<ApiResponse<IConfigCommissionResponseBody>>(
        APIRoutes.CONFIG_LIST,
        [data],
      )

      if (!response) {
        console.warn("configCommissionList - Response is undefined or null");
      }
      
      return response     
    } catch (error) {
      console.error("configCommission list service error:", error);
    
      throw error;
    }
  },
  updateStatus: async (data:IUpdateStatusRequest) => {  // IUpdateStatusRequest is the request body for the enable status api
    try {
    
      const response = await callApi<ApiResponse<IConfigCommissionResponseBody>>(
        APIRoutes.UPDATE_STATUS,
        [data],
      )

      if (!response) {
        console.warn("enable status api - Response is undefined or null");
      }
      
      return response     
    } catch (error) {
      console.error("enable status api service error:", error);
    
      throw error;
    }
  },

  commissionSearchFields: async (data: ICommissionSearchFieldsRequest) => {
    try {
      const response = await callApi<ApiResponse<ICommissionSearchFieldsResponseBody>>(
        APIRoutes.COMMISSION_SEARCH_FIELDS,
        [data],
      )

      if (!response) {
        console.warn("COMMISSION_SEARCH_FIELDS Response is undefined or null");
      }
      
      return response
    } catch (error) {
      console.error("COMMISSION_SEARCH_FIELDS api service error:", error);
      throw error;
    }
  },

  executiveHistoryList: async (data:IExecutiveHistoryRequest) => {
    try {
    
      const response = await callApi<ApiResponse<IExecutiveHistoryResponseBody>>(
        APIRoutes.EXECUTIVE_HISTORY_LIST,
        [data],
      )

      if (!response) {
        console.warn("EXECUTIVE_HISTORY_LIST - Response is undefined or null");
      }
      
      return response     
    } catch (error) {
      console.error("EXECUTIVE_HISTORY_LIST list service error:", error);
    
      throw error;
    }
  },

  editCommissionConfig: async (data:IConfigCommissionRequest) => {
    try {
      const response = await callApi<ApiResponse<IConfigCommissionResponseBody>>(
        APIRoutes.UPDATE_COMMISSION_CONFIG,
        [data],
      )
      console.log("editCommissionConfig service response:", response);
      return response 

    } catch (error) {
      console.error("editCommissionConfig service error:", error);
    }
  }



}
