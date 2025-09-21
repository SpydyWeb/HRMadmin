import CryptoJS from "crypto-js";
import { IpAddress } from "@/utils/IpAddress";

let HRM_Key =process.env.ENCRYPTION_KEY || null;

// Service
const encryptionService = {
  setHrm_Key: (key:string) => {
    HRM_Key = key;
  },
  getHrm_Key: () => {
    return HRM_Key;
  },

  encryptObject: (data:any) => {
    if (!HRM_Key) throw new Error("HRM_Key not set");
    const key = CryptoJS.enc.Utf8.parse(IpAddress._wer(HRM_Key));
    const iv = CryptoJS.enc.Utf8.parse(IpAddress._rp(HRM_Key));
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  },

  decryptObject: (encryptedData:any) => {
    if (!HRM_Key) throw new Error("HRM_Key not set");
    const key = CryptoJS.enc.Utf8.parse(IpAddress._wer(HRM_Key));
    const iv = CryptoJS.enc.Utf8.parse(IpAddress._rp(HRM_Key));
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  },
};

export default encryptionService;
