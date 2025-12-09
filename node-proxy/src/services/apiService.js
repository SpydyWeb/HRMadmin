const {  setEncryptionEnabled } = require("../config/encryptionConfig");
const { apiClient } = require("./apiclient");
const { APIRoutes } = require("./constant");
const { encryptionService } = require("./encryptionService");

const getHRMChunks = () => {
  const config = loadEncryptionConfig();
  const token = {
    HRMChunks: encryptionService.getHrm_Key(),
    isEncryptionEnabled: config,
  };
  return token;
};
const loadEncryptionConfig = () => {
  const enabled = false;
  setEncryptionEnabled(enabled);
  return enabled;
};
const login = (data) => {
  console.log(data);
  
  return apiClient.post(APIRoutes.LOGIN, data);
};
const search = (data, headers = {}) => {
  return apiClient.post(APIRoutes.AGENTSEARCH, data, { headers });
};
const searchbycode = (data, headers = {}) => {
  return apiClient.post(APIRoutes.AGENTBYCODE, data, { headers });
};
const Agentbyid = (data, headers = {}) => {
  return apiClient.post(APIRoutes.AGENTBYID, data, { headers });
};
const AgentByCode = (data, headers = {}) => {
  return apiClient.post(APIRoutes.AGENTBYCODE, data, { headers });
};
const GetMasters = (key, headers = {}) => {
  
  const response= apiClient.post(`${APIRoutes.GETMASTERS}/${key}`, {}, {
    headers,

  }
);

console.log("sdfs",`${JSON.stringify(key)}`);
  return response;
};

module.exports = {
  login,
  search,
  searchbycode,
  loadEncryptionConfig,
  getHRMChunks,
  Agentbyid,
  AgentByCode,
  GetMasters
};
