import encryptionService from './encryptionService'
import { APIRoutes } from './constant'
import { apiClient } from './apiClient'
import type { IHRMChunks } from '@/models/authentication'
import type { IEncryptAPIResponse } from '@/models/api'

//  Encrypted POST helper
export async function encryptedPost(url: string, body: any) {
  const encryptedBody = encryptionService.encryptObject(body)
  const res = await apiClient.post<IEncryptAPIResponse>(url, { requestEncryptedString: encryptedBody })
  if (!res.responseEncryptedString) {
    throw new Error('Invalid encrypted response')
  }
  const decryptObject=encryptionService.decryptObject(res.responseEncryptedString)
  return decryptObject
}
export function getChunks() {
  return apiClient.get<IHRMChunks>(APIRoutes.CHUNKS)
}

export async function callApi<T>(
  fn: string,
  args: Array<unknown> = [],
  headers: Record<string, string> = {}
): Promise<T> {
  return encryptedPost(APIRoutes.PROXY, { fn, args, headers }) as Promise<T>
}