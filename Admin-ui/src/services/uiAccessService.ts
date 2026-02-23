// src/services/uiAccessService.ts
import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type { ApiResponse } from '@/models/api'

export interface UIField {
  render: boolean
  cntrlid: number
  allowedit: boolean
  cntrlName: string
}

export interface UISubSection {
  type: string
  section: string
  subSection?: UISubSection[]
  fieldList?: UIField[]
}

export interface UIMenuItem {
  type: string
  section: string
  subSection?: UISubSection[]
}

export interface UIMenuResponse {
  uiMenu: UIMenuItem[]
}

export interface UIAccessResponse {
  uiMenuResponse: UIMenuResponse
}

// Mapping between tab values in the UI and section names in the API
export const TAB_SECTION_MAP: Record<string, string> = {
  'personaldetails': 'Personal',
  'peoplehierarchy': 'People Hierarchy',
  'geographicalhierarchy': 'Geographical Hierarchy',
  'partnersmapped': 'Partners Mapped',
  'auditlog': 'Audit Log',
  'licensedetails': 'License',
  'financialdetails': 'Financial',
  'entity360': 'Entity 360°',
  'training': 'Training',
}

export const uiAccessService = {
  getUIAccessPermissions: async (roleId: number, searchFor: number): Promise<UIAccessResponse> => {
    console.log('🚀 Calling allowUiAccess API with payload:', { roleId, searchFor });
    try {
      const response = await callApi<ApiResponse<UIAccessResponse>>(
        APIRoutes.ALLOW_UI_ACCESS,
        [roleId, searchFor]
      )
      console.log('📥 Raw UI Access API response:', response);
      console.log('📦 Response body:', response?.responseBody);
      console.log('🌳 UI Menu structure:', JSON.stringify(response?.responseBody, null, 2));
      
      const result = response?.responseBody || { uiMenuResponse: { uiMenu: [] } };
      console.log('✅ Returning UI Access data:', result);
      return result;
    } catch (error) {
      console.error('❌ Error calling UI Access API:', error);
      throw error;
    }
  },
}
