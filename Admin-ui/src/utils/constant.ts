export const RoutePaths = {
  DASHBOARD: '/dashboard',
  SEARCH: '/search',
  LOGIN: '/login',
  ENTITYMANAGEMENT: '/entitymanagement',
  HIERARCYTOOLS: '/hierarchytools',
  CERTIFICATIONS: '/certifications',
  PENDINGACTIONS: '/pendingactions',
  CHANNELREPORTS: '/channelreports',
  RESOURCES: '/resources',
  CMS: '/cms',
  SETTING: '/setting',
  CODEMOVEMENT: '/dashboard/code-movement',
  CERTIFICATIONUPDATE: '/dashboard/certification-update',
  TERMINATION: '/dashboard/termination',
  BULKACTION: '/dashboard/code-movement/bulk-action',
  CREATEBULK: '/dashboard/create-bulk',
  COMMISSION: '/commission',
   PROCESS_COMMISSION: '/commission/processcommission',
  HOLD_COMMISSION: '/commission/processcommission',
  ADJUST_COMMISSION: '/commission/processcommission',
  APPROVE_COMMISSION: '/commission/processcommission',
// Update your route paths
// PROCESS_COMMISSION: '/commission/processcommission/new',
// HOLD_COMMISSION: '/commission/processcommission/hold',
// ADJUST_COMMISSION: '/commission/processcommission/adjust',
// APPROVE_COMMISSION: '/commission/processcommission/approve',
}
export const STORAGE_KEY = 'ENCRYPTION_ENABLED'
export const NOTIFICATION_CONSTANTS = {
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
  INFO: 'info' as const,
  WARNING: 'warning' as const,
  ACTION: 'action' as const,
}

export const MASTER_DATA_KEYS = {
  BANK_ACC_TYPE: 'BankAccType',
  AGENT_CLASS: 'AgentClass',
  SALES_SUB_CHANNELS: 'SalesSubChannels',
  STATE: 'State',
  OCCUPATIONS: 'Occupations',
  MARITAL_STATUS: 'MaritalStatus',
  GENDER: 'Gender',
  EDUCATION_QUALIFICATION: 'EducationQualification',
  COUNTRY: 'Country',
  SALES_CHANNELS: 'SalesChannels',
  AGENT_TYPE_CATEGORY: 'AgentTypeCategory',
  SALUTATION: 'Salutation',
  CANDIDATE_TYPE: 'CandidateType',
  AGENT_TYPE: 'AgentType',
  COMMISSION_CLASS:"CommissionClass"
}
