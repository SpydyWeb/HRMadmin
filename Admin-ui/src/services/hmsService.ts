import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type { IHmsDashboardResponseBody, IHmsDashboardApiResponse, IChannelStatsApiResponse, IUploadFileListApiResponse, fileApiResponse, fileResponseBody } from '@/models/hmsdashboard'
import { apiClient } from './apiClient'

export const HMSService = {
  hmsDashboard: async (data: IHmsDashboardResponseBody) => {
    try {
      const response = await callApi<ApiResponse<IHmsDashboardApiResponse>>(
        APIRoutes.HMS_DASHBOARD,
        [data],
      )
      console.log("hms dashboard response", response)
      return response
    } catch (error) {
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

  downloadReport: async (id: string | number, reportType: string) => {
    try {
      // For blob downloads, we need to make a direct call with responseType: 'blob'
      // The proxy will return the blob directly without encryption
      // The Authorization header will be set by the apiClient interceptor
      const response = await apiClient.post<Blob>(
        APIRoutes.PROXY,
        {
          fn: APIRoutes.DOWNLOAD_REPORT,
          args: [id, reportType],
        },
        {
          responseType: 'blob',
        }
      )

      console.log("download report response", response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  getHmsFile: async (data: fileResponseBody) => {
    try {
      const response = await callApi<ApiResponse<fileApiResponse>>(
        APIRoutes.HMS_FILE,
        [data],
      )
      console.log("hms dashboard response", response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },
}