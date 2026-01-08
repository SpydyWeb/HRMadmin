const APIRoutes = {
  LOGIN: "/api/Auth/Login",
  AGENTSEARCH: "/api/Agent/Search",
  AGENTBYCODE: "/api/Agent/AgentByCode",
  AGENTBYID: "/api/Agent/AgentByid",
  GETMASTERS: "/api/AppMasters/get",
  GETCOMMISSION: "/api/CommissionMgmt/Dashboard",
  PROCESSCOMMISSION: "/api/CommissionMgmt/ProcessCommission",
  HOLDCOMMISSION: "/api/CommissionMgmt/HoldCommission",
  ADJUSTCOMMISSION: "/api/CommissionMgmt/AdjustCommission",
  APPROVECOMMISSION: "/api/CommissionMgmt/ApproveCommission",
  CONFIGCOMMISSION: "/api/CommissionConfig/CreateCommission",
  UPDATECONDITIONCONFIG: "/api/CommissionConfig/UpdateCommissionFormula",
  CONFIGLIST: "/api/CommissionConfig/CommissionJobConfigList",
  UPDATECRON: "/api/CommissionConfig/UpdateCronSetting",
  UPDATESTATUS: "/api/CommissionConfig/EnableDisableJob",
  COMMISSIONSEARCHFIELDS: "/api/CommissionConfig/CommissionSearchFieldsJson",
  EXECUTIVEHISTORYLIST: "/api/CommissionConfig/JobExecutionHistory",
  EDITAGENT: "/api/Agent/UpdateAgent",
  UPDATECOMMISSIONBYID: "/api/CommissionConfig/GetCommissionById",
};

module.exports = { APIRoutes };
