import encryptionService from './encryptionService'
import { APIRoutes } from './constant'
import { apiClient } from './apiClient'
import type { IHRMChunks } from '@/models/authentication'
import type { IEncryptAPIResponse } from '@/models/api'
import { auth } from '@/auth'
import { useEncryption } from '@/store/encryptionStore'

//  Helper: Wait until HRM_Key is available
async function ensureEncryptionKeyReady(retries = 10, delay = 200): Promise<void> {
  for (let i = 0; i < retries; i++) {
    const key = encryptionService.getHrm_Key()
    if (key) return
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  throw new Error('Encryption key not ready after waiting.')
}

//  Encrypted POST helper
export async function encryptedPost(url: string, body: any) {
  const encryptionEnabled = useEncryption()

  // 1️ If encryption not enabled, send plain request
  if (!encryptionEnabled) {
    const res = await apiClient.post(url, body)
    if (res?.status === 401) {
      // auth.logout()
    }
    return res
  }

  // 2️ Ensure encryption key is ready before proceeding
  await ensureEncryptionKeyReady()

  // 3 Encrypt request body
  const encryptedBody = encryptionService.encryptObject(body)

  // 4 Make encrypted request
  const res = await apiClient.post<IEncryptAPIResponse>(url, {
    requestEncryptedString: encryptedBody,
  })

  // 5️ Validate and decrypt
  if (!res.responseEncryptedString) {
    throw new Error('Invalid encrypted response from server')
  }

  const decryptedObject = encryptionService.decryptObject(res.responseEncryptedString)
  return decryptedObject
}

//  Fetch encryption chunks
export function getChunks() {
  return apiClient.get<IHRMChunks>(APIRoutes.CHUNKS)
}

//  Generic encrypted API call
export async function callApi<T>(
  fn: string,
  args: Array<unknown> = [],
  headers: Record<string, string> = {},
): Promise<T> {
  return encryptedPost(APIRoutes.PROXY, {
    fn,
    args,
    headers: { Authorization: `Bearer ${JSON.parse(auth.getToken())?.token}` },
  }) as Promise<T>
}
