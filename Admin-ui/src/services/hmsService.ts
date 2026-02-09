import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { IHmsDashboardResponseBody, IHmsDashboardApiResponse, IChannelStatsApiResponse, IChannelStatsResponseBody, IUploadFileListApiResponse } from '@/models/hmsdashboard'

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


  hmsOverviewStats: async () => {  
    try {
      const response = await callApi<ApiResponse<IChannelStatsApiResponse>>(
        APIRoutes.HMS_OVERVIEW_STATS,
        [{}], // Pass empty object as data parameter
      )
      console.log("hms channel stats response", response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  uploadFileList: async () => {
    try {
      const response = await callApi<ApiResponse<IUploadFileListApiResponse>>(
        APIRoutes.UPLOAD_FILE_LIST,
        [],
      )
      console.log("upload file list response", response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },
}