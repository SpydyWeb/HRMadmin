import encryptionService from './encryptionService'
import { APIRoutes } from './constant'
import { apiClient } from './apiClient'
import type { IHRMChunks } from '@/models/authentication'
import type { IEncryptAPIResponse } from '@/models/api'



// 🔹 Encrypted POST helper
export async function encryptedPost(url: string, body: any) {
  const encryptedBody = encryptionService.encryptObject(body)
  const res = await apiClient.post<IEncryptAPIResponse>(url, { requestEncryptedString: encryptedBody })
  if (!res.responseEncryptedString) {
    throw new Error('Invalid encrypted response')
  }
  return encryptionService.decryptObject(res.responseEncryptedString)
}
export function getChunks() {
  return apiClient.get<IHRMChunks>(APIRoutes.CHUNKS)
}

export async function callApi(fn: string, args = [], headers = {}) {
  console.log('====================================')
  console.log(fn, args, headers)
  console.log('====================================')
  return encryptedPost(APIRoutes.PROXY, { fn, args, headers })
}
