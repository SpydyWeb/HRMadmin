// src/services/inboxServices.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { IInboxRequest, IInboxResponseBody } from '@/models/inbox'

export interface IUpdateSrDecisionRequest {
  srNo: number
  approverDecision: number // 2 for approve, 3 for reject
}

export const inboxService = {
  InboxList: async (data: IInboxRequest) => {
    try {
      console.log("📬 InboxList service called with data:", JSON.stringify(data, null, 2));
      
      const response = await callApi<ApiResponse<IInboxResponseBody>>(
        APIRoutes.FETCH_INBOX_DATA,
        [data],
      )
     
      if (!response) {
        console.warn("⚠️ Inbox - Response is undefined or null");
        return null;
      }

      return response     
    } catch (error) {
      console.error("❌ Inbox list service error:", error);
      throw error;
    }
  },
  updateSrDecision: async (data: IUpdateSrDecisionRequest) => {
    try {
      console.log("✅ UpdateSrDecision service called with data:", JSON.stringify(data, null, 2));
      
      const response = await callApi<ApiResponse<{}>>(
        APIRoutes.UPDATE_SR_DECISION,
        [data],
      )
     
      if (!response) {
        console.warn("⚠️ UpdateSrDecision - Response is undefined or null");
        return null;
      }

      return response     
    } catch (error) {
      console.error("❌ UpdateSrDecision service error:", error);
      throw error;
    }
  },
}
