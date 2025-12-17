const { setEncryptionEnabled } = require("../config/encryptionConfig");
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
const GetMasters = (data, headers = {}) => {
  return apiClient.post(`${APIRoutes.GETMASTERS}/${data}`, {}, { headers });
};

const GetMastersBulk = async (keys, headers = {}) => {
  const promises = keys.map(async (key) => {
    try {
      const res = await apiClient.post(
        `${APIRoutes.GETMASTERS}/${key}`,
        {},
        {
          headers,
        }
      );
      return [key, res?.responseBody?.master || []];
    } catch (err) {
      console.error(`Error fetching master ${key}`, err);
      return [key, []];
    }
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results);
};

const getCommissionData = (data = {}, headers = {}) => {
  console.log("Fetching commission data with:", data);
  return apiClient.post(APIRoutes.GETCOMMISSION, data, { headers });
};


module.exports = {
  login,
  search,
  searchbycode,
  loadEncryptionConfig,
  getHRMChunks,
  Agentbyid,
  AgentByCode,
  GetMasters,
  GetMastersBulk,
  getCommissionData
};
