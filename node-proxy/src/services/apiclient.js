const axios = require("axios");
const { dotnetApiUrl } = require("../config");

// Create axios instance
const api = axios.create({
  baseURL: dotnetApiUrl,
  headers: { "Content-Type": "application/json" },
  validateStatus: () => true, // so 400/401 don't throw
});

//  Generic request wrapper with encryption/decryption
const request = async (method, url, data, config = {}) => {
  try {
    // Encrypt payload if data is provided
    const payload = data ? data: undefined;

    // Forward Authorization header if exists
    const headers = {
      ...(config.headers || {}),
    };

    const response = await api.request({
      method,
      url,
      data: payload,
      headers,
      ...config,
    });

    // Decrypt response if `data` field exists
    if (response.data && response.data.data) {
      return JSON.parse(response.data.data);
    }

    return response.data;
  } catch (error) {
    console.error("API Client Error:", error.message);
    throw error;
  }
};

// 🔹 Exported client
const apiClient = {
  get: (url, config) => request("get", url, undefined, config),
  post: (url, data, config) => request("post", url, data, config),
  put: (url, data, config) => request("put", url, data, config),
  delete: (url, config) => request("delete", url, undefined, config),
};

module.exports = { apiClient };
