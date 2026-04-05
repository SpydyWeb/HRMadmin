import axios, { AxiosRequestConfig, AxiosError } from 'axios'
import { APIRoutes, TOKEN_KEY } from './constant'
import { storage } from '@/utils/storage'
import { HMSService } from './hmsService'
import { authStore } from '@/store/authStore'
import { auth } from '@/auth'

/** Prefer VITE_API_URL; in dev, empty base uses Vite proxy → node-proxy (see vite.config.ts). */
function resolveAxiosBaseURL(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim().replace(/\/+$/, '')
  }
  if (import.meta.env.DEV) {
    return ''
  }
  return ''
}

const api = axios.create({
  baseURL: resolveAxiosBaseURL(),
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

/**
 * Updates the Authorization token inside the request body payload.
 * The backend reads the token from body.headers.Authorization,
 * so we must re-stamp it with the fresh token before retrying.
 */
const stampBodyToken = (request: AxiosRequestConfig, token: string) => {
  if (request.data && typeof request.data === 'object' && request.data.headers) {
    request.data = {
      ...request.data,
      headers: {
        ...request.data.headers,
        Authorization: `Bearer ${token}`,
      },
    }
  } else if (typeof request.data === 'string') {
    try {
      const parsed = JSON.parse(request.data)
      if (parsed.headers) {
        parsed.headers.Authorization = `Bearer ${token}`
        request.data = JSON.stringify(parsed)
      }
    } catch {
      // Not JSON, skip
    }
  }
}

/* ---------------- REQUEST INTERCEPTOR ---------------- */

api.interceptors.request.use((config) => {
  const stored = storage.get(TOKEN_KEY)

  if (stored) {
    try {
      const jwt = typeof stored === 'string' ? JSON.parse(stored) : stored

      if (jwt?.token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${jwt.token}`
      }
    } catch {
      console.warn('Invalid token in storage')
    }
  }

  return config
})

/* ---------------- RESPONSE INTERCEPTOR ---------------- */

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    /* ---- WAIT IF REFRESH ALREADY RUNNING ---- */

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          // Remove stale Authorization from HTTP headers.
          if (originalRequest.headers) {
            delete originalRequest.headers.Authorization
          }

          // Re-stamp the token inside the request body payload.
          stampBodyToken(originalRequest, token as string)

          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      /* ---- CALL REFRESH TOKEN API ---- */

      const refreshResponse = await HMSService.getRefreshToken()

      const data = refreshResponse.responseBody.loginResponse
      const newToken = data.token

      /* ---- SAVE NEW TOKEN ---- */

      storage.set(TOKEN_KEY, JSON.stringify(data))

      // Reset the auth module's in-memory cache so auth.getToken()
      // returns the fresh token on subsequent calls.
      auth.setToken(JSON.stringify(data))

      authStore.setState({
        token: data.token,
        user: data,
      })
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      /* ---- RELEASE QUEUED REQUESTS ---- */

      processQueue(null, newToken)

      /* ---- RETRY ORIGINAL REQUEST ---- */

      // Remove stale Authorization from HTTP headers — the request
      // interceptor will read the latest token from storage.
      if (originalRequest.headers) {
        delete originalRequest.headers.Authorization
      }

      // Also re-stamp the token inside the request body payload,
      // since the backend reads Authorization from body.headers.
      stampBodyToken(originalRequest, newToken)

      return api(originalRequest)
    } catch (err) {
      processQueue(err, null)

      storage.remove(TOKEN_KEY)

      window.location.href = '/login'

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)

/* ---------------- GENERIC REQUEST WRAPPER ---------------- */

const request = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.request<T>({
    method,
    url,
    data,
    ...config,
  })

  return response.data
}

/* ---------------- API CLIENT ---------------- */

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
