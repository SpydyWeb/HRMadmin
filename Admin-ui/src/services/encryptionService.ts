import CryptoJS from 'crypto-js'
import { IpAddress } from '@/utils/IpAddress'

let HRM_Key = process.env.ENCRYPTION_KEY || null

const encryptionService = {
  setHrm_Key: (key: string) => {
    HRM_Key = key
    if (typeof window !== 'undefined') {
      localStorage.setItem('HRMChunks', key) //  store key for persistence
    }
  },

  getHrm_Key: (): string | null => {
    if (HRM_Key) return HRM_Key

    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('HRMChunks')
      if (storedKey) {
        HRM_Key = storedKey
        return HRM_Key
      }
    }

    console.warn(' HRM_Key not found — please call setHrm_Key() before encryption/decryption.')
    return null
  },

  encryptObject: (data: any) => {
    const keyValue = encryptionService.getHrm_Key()
    if (!keyValue) throw new Error('HRM_Key not set')

    const key = CryptoJS.enc.Utf8.parse(IpAddress._wer(keyValue))
    const iv = CryptoJS.enc.Utf8.parse(IpAddress._rp(keyValue))

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    return encrypted.toString()
  },

  decryptObject: (encryptedData: any) => {
    const keyValue = encryptionService.getHrm_Key()
    if (!keyValue) throw new Error('HRM_Key not set')

    const key = CryptoJS.enc.Utf8.parse(IpAddress._wer(keyValue))
    const iv = CryptoJS.enc.Utf8.parse(IpAddress._rp(keyValue))

    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
    })

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
  },
}

export default encryptionService
