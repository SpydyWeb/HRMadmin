import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type {
  IGetUserDetailsRequest,
  ICreateUserRequest,
  IUpdateUserRequest,
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

}
