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
  CONFIGCOMMISSION: "/api/CommissionConfig/Save",
  UPDATECONDITIONCONFIG: "/api/CommissionConfig/update-condition",
};

module.exports = { APIRoutes };
