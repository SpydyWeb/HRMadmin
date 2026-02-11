// src/apiClient.ts
import axios, { AxiosRequestConfig } from 'axios'
import { APIRoutes, TOKEN_KEY } from './constant' 
import { storage } from '@/utils/storage'

const api = axios.create({
  baseURL:APIRoutes.BASEURL,
  // headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true, // so 400/401 don't throw
})

api.interceptors.request.use((config) => {
  const token = storage.get(TOKEN_KEY)
  if (token) {
    const jwt = JSON.parse(token) // assuming token stored as JSON { token: "xxx" }
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${jwt}`
  }
  return config
})


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
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>('get', url, undefined, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => request<T>('post', url, data, config),
  put:  <T>(url: string, data?: any, config?: AxiosRequestConfig) => request<T>('put', url, data, config),
  delete:<T>(url: string, config?: AxiosRequestConfig) => request<T>('delete', url, undefined, config),
}

export default api
