const { apiClient } = require("./apiclient");
const {APIRoutes} =require("./constant")

const login = (data) => {
  return apiClient.post(APIRoutes.LOGIN, data);
};
const search = (data,headers={}) => {
    return apiClient.post(APIRoutes.AGENTSEARCH, data,{headers});
};
const searchbycode = (data,headers={}) => {
    return apiClient.post(APIRoutes.AGENTBYCODE, data,{headers});
};

module.exports={login,search,searchbycode}