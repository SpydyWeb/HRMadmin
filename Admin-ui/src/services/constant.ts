export const TOKEN_KEY = 'auth_token'
export const APIRoutes = {
  // BASEURL:"/api/",
  BASEURL: process.env.REACT_API_URL || "http://localhost:5000/",
    PROXY:"api/proxy" ,
    CHUNKS:"getHRMChunks" ,
  // BASEURL:"http://ezytek1706-003-site1.rtempurl.com/api/",
  LOGIN: 'Auth/Login',
  AGENTSEARCH: 'Agent/Search',
  AGENTBYCODE: '/Agent/AgentByCode',
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
