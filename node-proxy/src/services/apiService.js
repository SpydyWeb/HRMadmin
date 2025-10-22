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
  return apiClient.post(APIRoutes.LOGIN, data);
};
const search = (data, headers = {}) => {
  return apiClient.post(APIRoutes.AGENTSEARCH, data, { headers });
};
const searchbycode = (data, headers = {}) => {
  return apiClient.post(APIRoutes.AGENTBYCODE, data, { headers });
};

module.exports = {
  login,
  search,
  searchbycode,
  loadEncryptionConfig,
  getHRMChunks,
};
