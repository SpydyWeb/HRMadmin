import { useState, useEffect } from 'react'
import encryptionService from '@/services/encryptionService'
import { getChunks } from '@/services/apiService'
import { setEncryption } from '@/store/encryptionStore'

export const useEncryptionReady = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedKey = localStorage.getItem('HRMChunks')

    if (storedKey) {
      encryptionService.setHrm_Key(storedKey)
      // setEncryption(true)
      setReady(true)
    } else {
      getChunks()
        .then((res) => {
          if (res.HRMChunks) {
            encryptionService.setHrm_Key(res.HRMChunks)
            localStorage.setItem('HRMChunks', res.HRMChunks)
            setEncryption(res.isEncryptionEnabled)
          }
        })
        .finally(() => setReady(true))
    }
  }, [])

  return ready
}
