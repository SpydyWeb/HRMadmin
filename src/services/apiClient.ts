import { env } from '@/env'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const BASE_URL = env.VITE_API_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Unified error handler
const handleError = (error: AxiosError) => {
  const message =
    (error.response?.data as any)?.message ||
    error.message ||
    'Something went wrong, please try again.'
  console.error('API Error:', message)
  throw new Error(message)
}

// Common request wrapper
const request = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.request<T>({
      method,
      url,
      data,
      ...config,
    })
    return response.data
  } catch (error) {
    handleError(error as AxiosError)
  }
}

// Export specific methods
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
