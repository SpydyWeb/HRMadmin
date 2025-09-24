export const TOKEN_KEY = 'auth_token'
export const APIRoutes = {
  BASEURL:"https://hrmadmin-nodeproxxy.onrender.com/",
  // BASEURL: process.env.REACT_API_URL || "http://localhost:5000/",
    PROXY:"api/proxy" ,
    CHUNKS:"getHRMChunks" ,
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
