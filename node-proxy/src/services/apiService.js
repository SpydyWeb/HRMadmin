const { apiClient } = require("./apiclient");
const login = (data) => {
  return apiClient.post(APIRoutes.LOGIN, data);
};
