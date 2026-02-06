import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { IHmsDashboardResponseBody, IHmsDashboardApiResponse, IChannelStatsApiResponse, IChannelStatsResponseBody } from '@/models/hmsdashboard'

export const HMSService = {
  hmsDashboard: async (data:IHmsDashboardResponseBody) => {
    try{
    const response = await callApi<ApiResponse<IHmsDashboardApiResponse>>(
      APIRoutes.HMS_DASHBOARD,
      [data],
    )
    console.log("hms dashboard response", response)
    return response
  }catch(error){
    console.error(error)
    throw error
  }
  }, 


  hmsOverviewStats: async (data:IChannelStatsResponseBody) => {  
    try {
      const response = await callApi<ApiResponse<IChannelStatsApiResponse>>(
        APIRoutes.HMS_OVERVIEW_STATS,
        [],
      )
      console.log("hms channel stats response", response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },
}