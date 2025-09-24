const { apiClient } = require("./apiclient");
const {APIRoutes} =require("./constant")

const login = (data) => {
  return apiClient.post(APIRoutes.LOGIN, data);
};

module.exports={login}