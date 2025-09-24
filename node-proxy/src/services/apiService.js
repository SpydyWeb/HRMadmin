const { apiClient } = require("./apiclient");
const {APIRoutes} =require("./constant")

const login = (data) => {
  console.log('====================================');
  console.log(data);
  console.log('====================================');
  return apiClient.post(APIRoutes.LOGIN, data);
};

module.exports={login}