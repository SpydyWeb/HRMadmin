// src/apiClient.ts
import axios, { AxiosRequestConfig } from 'axios'
import { APIRoutes, TOKEN_KEY } from './constant'
import { storage } from '@/utils/storage'
import { HMSService } from './hmsService'

const api = axios.create({
  baseURL: APIRoutes.BASEURL,
})

api.interceptors.request.use((config) => {
  const token = storage.get(TOKEN_KEY)

  if (token) {
    const jwt = JSON.parse(token)

    config.headers = config.headers ?? {}
      ; (config.headers as any).Authorization = `Bearer ${jwt.token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    console.log("SUCCESS:", response.status, response.config.url)
    return response
  },

  async (error) => {
    console.log("ERROR INTERCEPTOR HIT")
    console.log("STATUS:", error?.response?.status)
    console.log("URL:", error?.config?.url)

    const originalRequest = error.config

    if (error.response?.status === 401) {
      console.log("401 DETECTED")

      try {
        const refreshResponse = await HMSService.getRefreshToken()

        console.log("REFRESH SUCCESS")

        const { token, expiration } =
          refreshResponse.responseBody.loginResponse

        storage.set(TOKEN_KEY, JSON.stringify({ token, expiration }))

        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${token}`

        return api(originalRequest)
      } catch (err) {
        console.log("REFRESH FAILED")
        storage.remove(TOKEN_KEY)
      }
    }

    return Promise.reject(error)
  }
)

const request = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.request<T>({ method, url, data, ...config })
  return response.data
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>('get', url, undefined, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>('post', url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>('put', url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>('delete', url, undefined, config),
}

export default api
