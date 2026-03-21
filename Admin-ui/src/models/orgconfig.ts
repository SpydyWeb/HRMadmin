import { IResponseHeader } from './hmsdashboard'

// Field list item in the response
export interface IOrgConfigField {
  render: boolean
  cntrlid: number
  allowedit: boolean
  approverOneRoleId: number | null
  approverTwoRoleId: number | null
  approverThreeRoleId?: number | null
  useDefaultApprover: boolean
  /** Audit / change log flag when returned from API */
  isLog?: boolean
  createLog?: boolean
}

// SubSection can be Tab or Section
export interface IOrgConfigSubSection {
  type: string
  section: string
  componentId: number
  subSection?: IOrgConfigSubSection[]
  fieldList?: IOrgConfigField[]
}

// UI Menu item (Screen level)
export interface IOrgConfigUIMenu {
  type: string
  section: string
  componentId: number
  subSection?: IOrgConfigSubSection[]
}

// UI Menu Response
export interface IOrgConfigUIMenuResponse {
  uiMenu: IOrgConfigUIMenu[]
}

// Response Body
export interface IOrgConfigResponseBody {
  uiMenuResponse: IOrgConfigUIMenuResponse
}

// Full API Response
export interface IOrgConfigApiResponse {
  responseHeader: IResponseHeader
  responseBody: IOrgConfigResponseBody
}

// Request payload for updating org configuration
export interface IOrgConfigRequest {
  componentId: number
  approverOneId: number | null
  approverTwoId: number | null
  approverThreeId: number | null
  useDefaultApprover: boolean
  isLog?: boolean
}
