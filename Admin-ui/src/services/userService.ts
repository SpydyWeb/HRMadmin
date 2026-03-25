import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type {
  ICreateUserRequest,
  IUpdateUserRequest,
  IUpdatePasswordRequest,
  IUserDetailsResponseBody,
} from '@/models/user'



export const userManagementService = {

  UserDetails: async (data: any) => {
    try {
      console.log("📬 UserDetails service called with data:", JSON.stringify(data, null, 2));
      
      const response = await callApi<ApiResponse<IUserDetailsResponseBody>>(
        APIRoutes.GET_USER_DETAILS,
        [data],
      )
     
      if (!response) {
        console.warn("⚠️ UserDetails - Response is undefined or null");
        return null;
      }

      return response     
    } catch (error) {
      console.error("❌ UserDetails service error:", error);
      throw error;
    }
  },

  
  saveRegulatorBranchesForUser: async (payload: {
      userId: number
      branchIds: number[]
    }) => {
      const response = await callApi<ApiResponse<any>>(
        APIRoutes.SAVE_BRANCH_LINKED_USER,
        [payload],
      )
      console.log('RegulatorBranch/Save response:', response)
      // Keep full envelope so UI can read responseHeader.errorCode/message reliably.
      return response
    },
  
    fetchRegulatorBranchesByUser: async (payload: { userId: number }) => {
      try {
        const response = await callApi<ApiResponse<any>>(
          APIRoutes.FETCH_BRANCH_BY_USER,
          [payload],
        )
        return response.responseBody ?? response ?? null
      } catch (error: any) {
        const responseData = error?.response?.data
        const message = responseData?.responseHeader?.errorMessage

        // Only show API-provided message; never invent our own.
        if (message) {
          throw new Error(message)
        }

        // Fall back to original thrown error (axios/network/etc.)
        throw error
      }
    },

  CreateUser: async (data: ICreateUserRequest) => {
    try {
      console.log("📬 CreateUser service called with data:", JSON.stringify(data, null, 2));
      
      const response = await callApi<ApiResponse<IUserDetailsResponseBody>>(
        APIRoutes.CREATE_USER,
        [data],
      )
     
      if (!response) {
        console.warn("⚠️ CreateUser - Response is undefined or null");
        return null;
      }

      return response     
    } catch (error) {
      console.error("❌ CreateUser service error:", error);
      throw error;
    }
  },
 
  UpdateUser: async (data: IUpdateUserRequest) => {
    try {
      console.log("📬 UpdateUser service called with data:", JSON.stringify(data, null, 2));
      
      const response = await callApi<ApiResponse<IUserDetailsResponseBody>>(
        APIRoutes.UPDATE_USER,
        [data],
      )
     
      if (!response) {
        console.warn("⚠️ UpdateUser - Response is undefined or null");
        return null;
      }

      return response     
    } catch (error) {
      console.error("❌ UpdateUser service error:", error);
      throw error;
    }
  },

  UpdatePassword: async (data: IUpdatePasswordRequest) => {
    try {
      console.log("📬 UpdatePassword service called with data:", JSON.stringify({ ...data, oldPassword: '***', newPassword: '***' }, null, 2));
      
      const response = await callApi<ApiResponse<IUserDetailsResponseBody>>(
        APIRoutes.UPDATE_PASSWORD,
        [data],
      )
     
      if (!response) {
        console.warn("⚠️ UpdatePassword - Response is undefined or null");
        return null;
      }

      return response     
    } catch (error) {
      console.error("❌ UpdatePassword service error:", error);
      throw error;
    }
  },

}
