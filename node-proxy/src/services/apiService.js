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
const file = (data, headers = {}) => {
  console.log('====================================');
  console.log('File upload request:');
  console.log('Data type:', typeof data, 'Is FormData:', typeof data?.getHeaders === 'function');
  console.log('Headers:', headers);
  console.log('====================================');

  return apiClient.post(APIRoutes.UPLOADFILES, data, { headers }).then(response => {
    console.log('====================================');
    console.log('File upload response received:');
    console.log('Response type:', typeof response);
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('Response status:', response?.status);
    console.log('Response statusCode:', response?.statusCode);
    console.log('====================================');
    return response;
  }).catch(err => {
    console.error('====================================');
    console.error('File upload error:');
    console.error('Error:', err.message);
    console.error('====================================');
    throw err;
  });
};

const rolesList = (data, headers = {}) => {
  return apiClient.post(APIRoutes.GETROLES, data, { headers });
};

const deleteRole = async (data, headers = {}) => {
  const roleId = data?.roleId
  console.log("Deleting role:", roleId)
  return apiClient.post(`${APIRoutes.DELETEROLES}/${roleId}`, {}, { headers })
};

const fetchMenu = async (data, headers = {}) => {
  const roleId = data?.roleId
  return apiClient.post(`${APIRoutes.FETCHMENU}/${roleId}`, {}, { headers })
}

const userList = async (data, headers = {}) => {
  const roleId = data?.roleId
  return apiClient.post(`${APIRoutes.USERLIST}/${roleId}`, {}, { headers })
}

const grantMenu = async (data, headers = {}) => {
  console.log("gettingHere");
  console.log("grantMenu", data);
  console.log("FINAL REQUEST", {
    url: APIRoutes.GRANTMENU,
    body: {
      roleId: data.roleId,
      menuId: data.menuId,
    }
  });

  return apiClient.post(
    APIRoutes.GRANTMENU,     // ✅ NO roleId in URL
    {
      roleId: data.roleId,
      menuId: data.menuId,   // ✅ send menuId
    },
    { headers }
  );
};

const revokeMenu = async (data, headers = {}) => {
  console.log("revokeMenu", data);

  return apiClient.post(
    APIRoutes.REVOKEMENU,
    {
      roleId: data.roleId,
      menuId: data.menuId,
    },
    { headers }
  );
};

const removeUser = async (data, headers = {}) => {
  return apiClient.post(
    APIRoutes.REMOVEUSER,
    {
      userName: data.userName,
      roleId: data.roleId,
    },
    { headers }
  );
};


const createRole = async (data, headers = {}) => {
  return apiClient.post(
    APIRoutes.CREATEROLE,
    {
      roleName: data.roleName,
      rowVersion: data.rowVersion,
      role_ID: data.role_ID,
      isSystemRole: data.isSystemRole,
      isActive: data.isActive,
    },
    { headers }
  );
};

const addUser = async (data, headers = {}) => {
  return apiClient.post(
    APIRoutes.ADDUSER,
    {
      userName: data.userName,
      roleId: data.roleId,
    },
    { headers }
  );
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
const configList = (data = { pageNumber: 0, pageSize: 0 }, headers = {}) => {
  // console.log("config commission list:", data);
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
  // console.log("### search fields:", data);
  // console.log("### search fields headers:", headers);
  return apiClient.get(APIRoutes.COMMISSIONSEARCHFIELDS, {
    params: data,
    headers: headers
  });
};

const editAgentDetails = async (data, sectionName, agentid, headers = {}) => {


  console.log("📝 Edit agent details input:", data, `${APIRoutes.EDITAGENT}/${agentid}/${sectionName}`);
  if (!agentid) {
    throw new Error("Agent ID is required");
  }
  if (!sectionName) {
    throw new Error("Section name is required");
  }

  return apiClient.post(`${APIRoutes.EDITAGENT}/${agentid}/${sectionName}`, data, { headers });

};

const executiveHistoryList = (data = {}, headers = {}) => {
  // console.log("config commission executive history list:", data);
  const { jobConfigId } = data;
  const pathId = jobConfigId;
  if (!pathId) {
    throw new Error("jobConfigId is required for executive history list");
  }
  return apiClient.post(`${APIRoutes.EXECUTIVEHISTORYLIST}/${pathId}`, data, { headers });
};

const editCommission = (data = {}, headers = {}) => {
  const { commissionConfigId } = data;
  const ConfigId = commissionConfigId;
  // console.log("config  Edit commission steps:", data);
  return apiClient.post(`${APIRoutes.UPDATECOMMISSIONBYID}/${ConfigId}`, data, { headers });
};

const downloadRecord = (data = {}, headers = {}) => {
  const { jobExeHistId } = data;
  if (!jobExeHistId) {
    throw new Error("jobExeHistId is required for download record");
  }
  return apiClient.post(`${APIRoutes.DOWNLOADRECORD}/${jobExeHistId}`, data, { headers });
};

const GeoHierarchy = (channelCategory,subChannelCode,branchCode, headers = {}) => {
  if (!channelCategory && !branchCode) {
    throw new Error("channelCategory is required for GeoHierarchy");
  }
  console.log("Fetching GeoHierarchy with channelCategory:", channelCategory, "subChannelCode:", subChannelCode, "branchCode:", branchCode);
  return apiClient.post(APIRoutes.GEOHIERARCHY, { channelCode: channelCategory, subChannelCode: subChannelCode, branchCode: branchCode }, { headers });
};

const GeoHierarchyTable = (parentBranchId, headers = {}) => {
  return apiClient.post(APIRoutes.GEOHIERARCHYTABLE, { parentBranchId: parentBranchId }, { headers });
}

const hmsDashboard = (data = {}, headers = {}) => {
  return apiClient.post(APIRoutes.HMSDASHBOARD, data, { headers });
}

const getChannelStats = (data = {}, headers = {}) => {
  console.log("Fetching channel stats with data:", data);
  console.log("Fetching channel stats with headers:", headers);
  return apiClient.post(APIRoutes.CHANNELSTATS, data, { headers });
}

const uploadFileList = (headers = {}) => {
  console.log("uploadFileList called");
  return apiClient.post(APIRoutes.UPLOADFILELIST, {}, { headers });
}

const downloadReport = (data = {}, headers = {}) => {
  const { id, reportType } = data;
  if (!id || !reportType) {
    throw new Error("reportId and reportType are required for download report");
  }
  return apiClient.post(`${APIRoutes.DOWNLOADREPORT}/${id}/${reportType}`, data, { headers, });
}
 const allowUiAccess = ( roleId,searchFor, headers = {}) => {
  return apiClient.post(APIRoutes.UIACCESSALLOW, { roleId, searchFor }, { headers });
}

module.exports = {
  login,
  search,
  searchbycode,
  loadEncryptionConfig,
  getHRMChunks,
  Agentbyid,
  AgentByCode,
  GetMasters,
  file,
  userList,
  fetchMenu,
  rolesList,
  grantMenu,
  createRole,
  removeUser,
  revokeMenu,
  GetMastersBulk,
  getCommissionData,
  processCommission,
  holdCommission,
  adjustCommission,
  approveCommission,
  configcommission,
  deleteRole,
  updateConditionConfig,
  configList,
  updateCron,
  addUser,
  updateStatus,
  searchFieldsConfig,
  editAgentDetails,
  executiveHistoryList,
  editCommission,
  downloadRecord,
  GeoHierarchy,
  GeoHierarchyTable,
  hmsDashboard,
  getChannelStats,
  uploadFileList,
  downloadReport,
  allowUiAccess

};
