export const TOKEN_KEY = 'auth_token'
export const APIRoutes = {
  // BASEURL:"https://hrmadmin-nodeproxxy.onrender.com/",
  BASEURL: import.meta.env.VITE_API_URL,
  PROXY: 'api/proxy',
  CHUNKS: 'getHRMChunks',
  SEARCH: 'search',
  SEARCHBYCODE: 'searchbycode',
  LOGIN: 'login',
  AGENTBYID: 'Agentbyid',
  AGENTBYCODE: 'AgentByCode',
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
