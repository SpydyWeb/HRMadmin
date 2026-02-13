export const TOKEN_KEY = 'auth_token'
export const APIRoutes = {
  // BASEURL:"https://hrmadmin-nodeproxxy.onrender.com/",
  BASEURL: import.meta.env.VITE_API_URL,
  PROXY: '/api/proxy',
  UPLOADPROXY: '/api/upload',
  CHUNKS: 'getHRMChunks',
  SEARCH: 'search',
  SEARCHBYCODE: 'searchbycode',
  LOGIN: 'login',
  AGENTBYID: 'Agentbyid',
  AGENTBYCODE: 'AgentByCode',
  GETCOMMISSIONDATA: 'getCommissionData',
  GETMASTERS: 'GetMasters',
  PROCESSCOMMISSION: 'processCommission',
  HOLDCOMMISSION: 'holdCommission',
  ADJUSTCOMMISSION: 'adjustCommission',
  APPROVECOMMISSION: 'approveCommission',
  CONFIG_COMMISSION: 'configcommission',
  UPDATE_CONDITION_CONFIG: 'updateConditionConfig',
  CONFIG_LIST: 'configList',
  UPDATE_CRON: 'updateCron',
  UPDATE_STATUS: 'updateStatus',
  COMMISSION_SEARCH_FIELDS: 'searchFieldsConfig',
  EDIT_AGENT: 'editAgentDetails',
  EXECUTIVE_HISTORY_LIST: 'executiveHistoryList',
  UPDATE_COMMISSION_CONFIG: 'editCommission',
  DOWNLOAD_RECORD: 'downloadRecord',
  GEO_HIERARCHY: 'GeoHierarchy',
  GEO_HIERARCHY_TABLE: 'GeoHierarchyTable',
  HMS_DASHBOARD: 'hmsDashboard',
  HMS_OVERVIEW_STATS: 'getChannelStats',
  UPLOAD_FILE_LIST: 'uploadFileList',
  DOWNLOAD_REPORT: 'downloadReport',
  HMS_FILE: 'file',
  GET_ROLES: 'rolesList',
}

export const LoginConstants = {
  INVALID_CREDENTIALS: 1001,
  ACCOUNT_LOCKED: 1002,
  NO_ACTIVE_PRIMARY_ROLE: 1003,
}

export const CommonConstants = {
  SUCCESS: 1101,
}

export const AgentConstants = {
  AGENT_NOTFOUND: 1201,
}
