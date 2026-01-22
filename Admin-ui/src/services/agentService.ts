// src/services/authService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ILoginResponseBody } from '@/models/authentication'
import type { ApiResponse } from '@/models/api'
import type {
  IAgentSearchByCodeRequest,
  IAgentSearchRequest,
  IAgent,
  IEditAgentPayload,
} from '@/models/agent'

export const agentService = {
  search: (data: IAgentSearchRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.SEARCH, [data]),
  searchbycode: (data: IAgentSearchByCodeRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.SEARCHBYCODE, [data]),
  AgentByCode: (data: IAgentSearchByCodeRequest) =>
    callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.AGENTBYCODE, [data]),
  // editAgent: (data: IEditAgentPayload) =>
  //   callApi<ApiResponse<ILoginResponseBody>>(APIRoutes.EDIT_AGENT, [data]),
  editAgent: async (data: IEditAgentPayload) => {
  console.log('EDIT_AGENT route:', APIRoutes.EDIT_AGENT);
  console.log('EDIT_AGENT payload:', data);

  const response = await callApi<ApiResponse<ILoginResponseBody>>(
    APIRoutes.EDIT_AGENT,
    [data]
  );

  console.log('EDIT_AGENT full response:', response);
  console.log('EDIT_AGENT responseBody:', response?.responseBody);

  return response;
},

  fetchAgentHierarchy: async (data: IAgentSearchByCodeRequest) => {
    const response = await callApi<ApiResponse<ILoginResponseBody>>(
      APIRoutes.AGENTBYID,
      [data],
      
    )
    console.log('agent', response)
    return response.responseBody?.agents?.[0] || null
  },
}
