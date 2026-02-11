const axios = require("axios");
const { dotnetApiUrl } = require("../config");

// Create axios instance
const api = axios.create({
  baseURL: dotnetApiUrl,
  // headers: { "Content-Type": "application/json" },
  validateStatus: () => true, // so 400/401 don't throw
});

//  Generic request wrapper with encryption/decryption
const request = async (method, url, data, config = {}) => {
  try {
    // Encrypt payload if data is provided
    const payload = data ? data : undefined;

    // Check if data is FormData
    const isFormData = payload && typeof payload.getHeaders === 'function';

    // Forward Authorization header if exists
    const headers = {
      ...(config.headers || {}),
    };

    // For FormData, don't set Content-Type - let axios/form-data handle it
    const requestConfig = {
      method,
      url,
      data: payload,
      headers,
    };

    // If it's FormData and headers contain form-data headers, apply them properly
    if (isFormData) {
      requestConfig.headers = {
        ...payload.getHeaders(),
        ...(config.headers || {}),
      };
    }

    // Merge other config options but avoid overriding data/method/url
    Object.keys(config).forEach(key => {
      if (!['headers', 'data', 'method', 'url'].includes(key)) {
        requestConfig[key] = config[key];
      }
    });

    console.log('🌐 API Request:', method.toUpperCase(), url);
    const response = await api.request(requestConfig);
    console.log('📥 API Response Status:', response.status || response.statusCode);
    console.log('📥 API Response Data:', response.data ? (typeof response.data === 'string' ? response.data.substring(0, 100) : JSON.stringify(response.data).substring(0, 100)) : 'null');

    // Handle blob responses (file downloads)
    if (config.responseType === 'blob' || config.responseType === 'arraybuffer') {
      return response.data;
    }

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
  patch: (url, data, config) => request("patch", url, data, config),
};

module.exports = { apiClient };
