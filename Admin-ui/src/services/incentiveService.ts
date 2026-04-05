import { apiClient } from '@/services/apiClient'

export type UpsertProgramRequest = {
  programName: string
  description: string
  effectiveFrom: string
  effectiveTo: string
}

export type WeightageDto = {
  id?: number | string
  weightageId?: number | string
  code?: string
  name?: string
  label?: string
  description?: string
  isActive?: boolean
}

export type UpsertProgramWeightagesRequest = {
  programId: number
  weightageIds: number[]
}

export type UpsertWeightageMasterRequest = {
  weightageName: string
  startDate: string
  endDate: string
}

// Backend endpoint (direct HMS API).
// Using absolute URL keeps this working even if VITE_API_URL points to a proxy.
const INCENTIVE_UPSERT_PROGRAM_URL =
  'http://hmsapi.ezytekapis.com/api/incentive/UpsertProgram'

const INCENTIVE_GET_WEIGHTAGES_URL =
  'http://hmsapi.ezytekapis.com/api/incentive/GetWeightages'

const INCENTIVE_UPSERT_PROGRAM_WEIGHTAGES_URL =
  'http://hmsapi.ezytekapis.com/api/incentive/UpsertProgramWeightages'

const INCENTIVE_FILTERS_CASCADE_URL =
  'http://hmsapi.ezytekapis.com/api/incentive/filters/cascade'

const INCENTIVE_UPSERT_WEIGHTAGE_URL =
  'http://hmsapi.ezytekapis.com/api/incentive/UpsertWeightage'

export type FilterCascadeRequest = {
  channelId?: number | null
  subChannelId?: number | null
  branchId?: number | null
}

export const incentiveService = {
  upsertProgram: async (data: UpsertProgramRequest) => {
    return apiClient.post<any>(INCENTIVE_UPSERT_PROGRAM_URL, data, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
  },

  upsertWeightageMaster: async (data: UpsertWeightageMasterRequest) => {
    return apiClient.post<any>(INCENTIVE_UPSERT_WEIGHTAGE_URL, data, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
  },

  getWeightages: async () => {
    // Match curl: --data-urlencode '%7D='  →  form body `}=` (key "}", empty value)
    const form = new URLSearchParams([['}', '']])
    return apiClient.post<any>(INCENTIVE_GET_WEIGHTAGES_URL, form, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },

  upsertProgramWeightages: async (data: UpsertProgramWeightagesRequest) => {
    return apiClient.post<any>(INCENTIVE_UPSERT_PROGRAM_WEIGHTAGES_URL, data, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
  },

  /** Cascade filter: pass channelId for child level; omit or use 0 for root channels (API-dependent). */
  postFilterCascade: async (body: FilterCascadeRequest = {}) => {
    return apiClient.post<any>(INCENTIVE_FILTERS_CASCADE_URL, body, {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
  },
}

