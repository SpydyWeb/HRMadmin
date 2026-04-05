const axios = require("axios");
const { dotnetApiUrl } = require("../config");

// Create axios instance
const api = axios.create({
  baseURL: dotnetApiUrl,
  // headers: { "Content-Type": "application/json" },
  validateStatus: () => true, // so 400/401 don't throw
});

function isAbsoluteHttpUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

//  Generic request wrapper with encryption/decryption
const request = async (method, url, data, config = {}) => {
  try {
    // Encrypt payload if data is provided
    const payload = data ? data : undefined;

    // Check if data is FormData
    const isFormData = payload && typeof payload.getHeaders === "function";

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
    Object.keys(config).forEach((key) => {
      if (!["headers", "data", "method", "url"].includes(key)) {
        requestConfig[key] = config[key];
      }
    });
    console.log("🌐 API Request:", method.toUpperCase(), url);
    // Absolute URLs (e.g. hmsapi.ezytekapis.com) must not be joined with dotnetApiUrl — avoids bad URLs / 404s.
    const http = isAbsoluteHttpUrl(url) ? axios : api;
    const response = await http.request({
      ...requestConfig,
      validateStatus: () => true,
      ...(isAbsoluteHttpUrl(url) ? { baseURL: undefined } : {}),
    });
    console.log(
      "📥 API Response Status:",
      response.status || response.statusCode,
    );
    console.log(
      "📥 API Response Data:",
      response.data
        ? typeof response.data === "string"
          ? response.data.substring(0, 100)
          : JSON.stringify(response.data).substring(0, 100)
        : "null",
    );

    // Handle blob responses (file downloads)
    if (
      config.responseType === "blob" ||
      config.responseType === "arraybuffer"
    ) {
      return response.data;
    }

    // If backend wraps payload under `data`, unwrap it but keep HTTP status.
    // The /api/proxy route expects this function to ALWAYS return { status, data }.
    let responseData = response.data;
    if (responseData && responseData.data) {
      responseData = JSON.parse(responseData.data);
    }

    return {
      status: response.status ?? 200,
      data: responseData,
    };
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
