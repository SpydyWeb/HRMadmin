
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { masterService } from '@/services/masterService'

type MasterMap = Record<string, any[]>

export const useMasterData = (keys: string[]) => {
  // console.log('renderr.....................');
  
  const sortedKeys = useMemo(() => [...keys].sort(), [keys])

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<MasterMap, Error>({
    queryKey: ['master-data', sortedKeys],
    queryFn: () => masterService.getMastersBulk(sortedKeys),
    staleTime: 1000 * 60 * 60,      // 1 hour
    gcTime: 1000 * 60 * 60 * 6,     // keep in cache
  })

  const masterData = data ?? {}
  const getOptions = (key: string) => {
    const items = masterData[key] || []
    // console.log("see",masterData,key,items.map((x: any) => ({
    //   label: x.entryDesc ?? x.name ?? '',
    //   value: x.entryIdentity ?? x.id,
    // })));
    
    return items.map((x: any) => ({
      label: x.entryDesc ?? x.name ?? '',
      value: x.entryIdentity ?? x.id,
    }))
  }

  const getDescription = (key: string, value: any) => {
    if (value == null) return ''
    const items = masterData[key] || []
    const item = items.find(
      (x: any) => (x.entryIdentity ?? x.id)?.toString() === value?.toString()
    )
    return item?.entryDesc ?? item?.name ?? ''
  }

  return {
    masterData,
    isLoading,
    isError,
    error,
    getOptions,
    getDescription,
  }
}
