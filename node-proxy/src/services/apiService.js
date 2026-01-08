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
  // console.log("Fetching commission data with:", data);
  return apiClient.post(APIRoutes.GETCOMMISSION, data, { headers });
};
const processCommission = (data = {}, headers = {}) => {
  // console.log("Process commission with:", data);
  return apiClient.post(APIRoutes.PROCESSCOMMISSION, data, { headers });
};
const holdCommission = (data = {}, headers = {}) => {
  // console.log("hold commission with:", data);
  return apiClient.post(APIRoutes.HOLDCOMMISSION, data, { headers });
};
const adjustCommission = (data = {}, headers = {}) => {
  // console.log("Adjust commission with:", data);
  return apiClient.post(APIRoutes.ADJUSTCOMMISSION, data, { headers });
};
const approveCommission = (data = {}, headers = {}) => {
  // console.log("Approve commission with:", data);
  return apiClient.post(APIRoutes.APPROVECOMMISSION, data, { headers });
};
const configcommission = (data = {}, headers = {}) => {
  // console.log("Config commission with:", data);
  return apiClient.post(APIRoutes.CONFIGCOMMISSION, data, { headers });
};
const updateConditionConfig = (data = {}, headers = {}) => {
  // console.log("update Condition Config commission with:", data);
  return apiClient.post(APIRoutes.UPDATECONDITIONCONFIG, data, { headers });
};
const configList = (data = {}, headers = {}) => {
  console.log("config commission list:", data);
  return apiClient.post(APIRoutes.CONFIGLIST, data, { headers });
};
const updateCron = (data = {}, headers = {}) => {
  console.log("config commission cron:", data);
  return apiClient.post(APIRoutes.UPDATECRON, data, { headers });
};
const updateStatus = (data = {}, headers = {}) => {
  console.log("config commission STATUS:", data);
  return apiClient.post(APIRoutes.UPDATESTATUS, data, { headers });
};
const searchFieldsConfig = (data = {}, headers = {}) => {
  console.log("config commission search fields:", data);
  return apiClient.post(APIRoutes.COMMISSIONSEARCHFIELDS, data, { headers });
};

const editAgentDetails = (data = {}, headers = {}) => {
  console.log("Edit agent details:", data);
  // Extract agentId and sectionName from data for URL path
  const { agentId, sectionName } = data;
  // Send full data object in body (including agentId and sectionName as per API spec)
  return apiClient.post(`${APIRoutes.EDITAGENT}/${agentId}/${sectionName}`, data, { headers });
};
const executiveHistoryList = (data = {}, headers = {}) => {
  console.log("config commission executive history list:", data);
  const { commissionConfigId } = data;
  const pathId =  commissionConfigId;
  if (!pathId) {
    throw new Error("commissionConfigId is required for executive history list");
  }
  return apiClient.post(`${APIRoutes.EXECUTIVEHISTORYLIST}/${pathId}`, data, { headers });
};

const editCommission = (data = {}, headers = {}) => {
  const { commissionConfigId } = data;
  const ConfigId = commissionConfigId;
  console.log("config  Edit commission steps:", data);
  return apiClient.post(`${APIRoutes.UPDATECOMMISSIONBYID}/${ConfigId}`, data, { headers });
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
  getCommissionData,
  processCommission,
  holdCommission,
  adjustCommission,
  approveCommission,
  configcommission,
  updateConditionConfig,
  configList,
  updateCron, 
  updateStatus,
  searchFieldsConfig,
  editAgentDetails,
  executiveHistoryList ,
  editCommission                           
};
