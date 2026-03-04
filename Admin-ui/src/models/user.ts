// User Management Models

// Request interface for GetUserDetails API
export interface IGetUserDetailsRequest {
  username?: string
  emailId?: string
  mobileNumber?: string
  reportingMgr?: number
}

// User Details interface
export interface IUserDetails {
  userId?: number
  username?: string
  emailId?: string
  mobileNumber?: string
  reportingMgrName?: string
  isActive?: boolean
  isLocked?: boolean
  password?: string
  [key: string]: any // Allow for additional fields that might be returned
}

// Response body interface for GetUserDetails
export interface IUserDetailsResponseBody {
  userDetails?: IUserDetails[]
  userDetail?: IUserDetails // Single user detail (if API returns single object)
  userOtherDetails?: IUserDetails[] // Alternative response format
  userOtherDetail?: IUserDetails // Alternative response format (single object)
}

// Request interface for CreateUser API
export interface ICreateUserRequest {
  username: string
  emailId: string
  mobileNumber: string
  firstName?: string
  lastName?: string
  reportingMgr?: number
  roleId?: number
  organizationId?: number
  password?: string
  [key: string]: any
}

// Request interface for UpdateUser API
export interface IUpdateUserRequest {
  userId: number
  username?: string
  emailId?: string
  mobileNumber?: string
  firstName?: string
  lastName?: string
  reportingMgr?: number
  roleId?: number
  [key: string]: any
}

// Request interface for UpdatePassword API
export interface IUpdatePasswordRequest {
  username: string
  oldPassword: string
  newPassword: string
  isActive: boolean
  isLocked: boolean
  reportingMgr: number
}