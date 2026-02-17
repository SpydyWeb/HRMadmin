import { callApi, uploadFile } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'
import type {
  IHmsDashboardResponseBody,
  IHmsDashboardApiResponse,
  IDownloadReportRequest,
  IChannelStatsApiResponse,
  IDownloadReportResponseBody,
  IUploadFileListApiResponse,
  fileApiResponse,
  fileResponseBody,
} from '@/models/hmsdashboard'
import { apiClient } from './apiClient'

export const HMSService = {
  hmsDashboard: async (data: IHmsDashboardResponseBody) => {
    try {
      const response = await callApi<ApiResponse<IHmsDashboardApiResponse>>(
        APIRoutes.HMS_DASHBOARD,
        [data],
      )
      console.log('hms dashboard response', response)
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
      console.log('hms channel stats response', response)
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
      console.log('upload file list response', response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  downloadReport: async (data: IDownloadReportRequest) => {
    try {
      const response = await callApi<ApiResponse<IDownloadReportResponseBody>>(
        APIRoutes.DOWNLOAD_REPORT,
        [data],
      )
      return response
    } catch (error) {
      console.error('downloadRecord service error:', error)
      throw error
    }
  },

  getHmsFile: async (formData: FormData) => {
    try {
      const response = await uploadFile<ApiResponse<fileApiResponse>>(
        formData
      )
      console.log('hms file upload response', response)
      return response
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  getRoles: async () => {
    try {
      const response = await callApi(
        APIRoutes.GET_ROLES,
        [{}],
      )
      return response
    } catch (error) {
      console.error('downloadRecord service error:', error)
      throw error
    }
  },

  deleteRoles: async (roleId: number | string) => {
    try {
      const response = await callApi(
        APIRoutes.DELETE_ROLES,
        [
          { roleId }
        ],
      )

      return response
    } catch (error) {
      console.error('delete role service error:', error)
      throw error
    }
  },

  fetchMenu: async (roleId: number | string) => {
    try {
      const response = await callApi(
        APIRoutes.FETCH_MENU,
        [
          { roleId }
        ],
      )

      return response
    } catch (error) {
      console.error('fetch menu service error:', error)
      throw error
    }
  },

  fetchRoleUsers: async (roleId: number | string) => {
    try {
      const response = await callApi(
        APIRoutes.ROLE_USER_LIST,
        [{ roleId }]
      )
      return response
    } catch (error) {
      console.error('fetch role users error:', error)
      throw error
    }
  },

  grantMenuAccess: async (payload: {
    roleId: number
    menuId: number
  }) => {
    return callApi("grantMenu", [
      payload
    ])
  },

  revokeMenuAccess: async (payload: {
    roleId: number
    menuId: number
  }) => {
    return callApi("revokeMenu", [
      payload
    ])
  },

  removeUserFromRole: async (payload: {
    userName: string
    roleId: number
  }) => {
    return callApi("removeUser", [
      payload
    ])
  },

  createRole: async (payload: {
    roleName: string
    rowVersion: number
    role_ID: number
    isSystemRole: boolean
    isActive: boolean
  }) => {
    return callApi("createRole", [
      payload
    ])
  },

  assignUserToRole: async (payload: {
    userName: string
    roleId: number
  }) => {
    return callApi("addUser", [
      payload
    ])
  },

}
