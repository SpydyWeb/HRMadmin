import axios, { AxiosRequestConfig, AxiosError } from "axios"
import { APIRoutes, TOKEN_KEY } from "./constant"
import { storage } from "@/utils/storage"
import { HMSService } from "./hmsService"

const api = axios.create({
  baseURL: APIRoutes.BASEURL,
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = storage.get(TOKEN_KEY)

  if (token) {
    const jwt = typeof token === "string" ? JSON.parse(token) : token

    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${jwt.token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          }
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshResponse = await HMSService.getRefreshToken()

      const { token, expiration } =
        refreshResponse.responseBody.loginResponse

      storage.set(TOKEN_KEY, JSON.stringify({ token, expiration }))

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      processQueue(null, token)

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${token}`,
      }

      return api(originalRequest)
    } catch (err) {
      processQueue(err, null)

      storage.remove(TOKEN_KEY)

      window.location.href = "/login"

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

const request = async <T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.request<T>({
    method,
    url,
    data,
    ...config,
  })

  return response.data
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>("get", url, undefined, config),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>("post", url, data, config),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>("put", url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>("delete", url, undefined, config),
}

export default api