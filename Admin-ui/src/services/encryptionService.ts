// encryptionService.ts
import CryptoJS from 'crypto-js'
import { IpAddress } from '@/utils/IpAddress'

let HRM_Key: string | null = null

const isBrowser = () => typeof window !== 'undefined'

const storage = {
  getItem: (k: string) => (isBrowser() ? window.localStorage.getItem(k) : null),
  setItem: (k: string, v: string) => {
    if (isBrowser()) window.localStorage.setItem(k, v)
  },
}


const encryptionService = {
 setHrm_Key: (key: string) => {
    HRM_Key = key
    storage.setItem('HRMChunks', key)
  },

  getHrm_Key: (): string | null => {
    if (HRM_Key) return HRM_Key
    if (!isBrowser()) return null

    const storedKey = storage.getItem('HRMChunks')
    if (storedKey) {
      HRM_Key = storedKey
      return HRM_Key
    }

    return null
  },


  encryptObject: (data: unknown) => {
    console.log('Encrypting data:', data)
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

  decryptObject: (encryptedData: string) => {
    const keyValue = encryptionService.getHrm_Key()
    if (!keyValue) throw new Error('HRM_Key not set')

    const key = CryptoJS.enc.Utf8.parse(IpAddress._wer(keyValue))
    const iv = CryptoJS.enc.Utf8.parse(IpAddress._rp(keyValue))

    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    const plaintext = decrypted.toString(CryptoJS.enc.Utf8)
    if (!plaintext) throw new Error('Decryption failed. Possibly wrong key/iv.')
    return JSON.parse(plaintext)
  },
}

export default encryptionService
