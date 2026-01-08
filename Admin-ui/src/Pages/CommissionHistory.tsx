import React, { useEffect, useState } from 'react'
import DataTable from '@/components/table/DataTable'
import Button from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter } from '@/components/Filter'
import { BiDownload } from 'react-icons/bi'
import Loader from '@/components/Loader'
import { useQuery } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import type { IexecutiveJobListResponseBody } from '@/models/commission'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'

const CommissionHistory: React.FC = () => {
  // const search = useSearch({ strict: false })
  // const commissionName = (search as any)?.commissionName || 'Commission History'
  // const commissionId = (search as any)?.commissionId || '12'
  const commissionId =12

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [localError, setLocalError] = useState<string | null>(null)

  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  // Convert commissionId to number for API call
  const commissionConfigId = commissionId ? Number(commissionId) : 0

  // Fetch executive history list
  const {
    data: historyResponse,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorObj,
  } = useQuery<any>({
    queryKey: ['executive-history-list', commissionConfigId],
    enabled: canFetch && commissionConfigId > 0,
    queryFn: () => commissionService.executiveHistoryList({ commissionConfigId }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Extract data from API response - handle multiple possible response structures
  // let historyData: IexecutiveJobListResponseBody[] = []
  
  // if (historyResponse) {
  //   // Try different possible response structures
  //   if (historyResponse?.responseBody?.jobExecutionHistory) {
  //     historyData = historyResponse.responseBody.jobExecutionHistory?.[0]
  //   } 
  // }

  const historyData: IexecutiveJobListResponseBody[] = React.useMemo(() => {
    if (!historyResponse) return []
  
    const raw = historyResponse?.responseBody?.jobExecutionHistory
  
    // Case 1: already an array
    if (Array.isArray(raw)) return raw
  
    // Case 2: array inside array (your current API)
    if (Array.isArray(raw?.[0])) return raw[0]
  
    // Fallback
    return []
  }, [historyResponse])
  

  useEffect(() => {
    if (historyError) {
      const msg =
        (historyErrorObj as any)?.message || 'Failed to fetch commission history'
      setLocalError(msg)
    } else {
      setLocalError(null)
    }
  }, [historyError, historyErrorObj])

 

  // Filter data based on search term and status
  // const filteredData = historyData.filter((item) => {
  //   const matchesSearch =
  //     item.startedAt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.finishedAt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.exeStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.duration?.toLowerCase().includes(searchTerm.toLowerCase())
  //   const matchesStatus = statusFilter === 'All' || item.exeStatus === statusFilter

  //   return matchesSearch && matchesStatus
  // })
  const filteredData = React.useMemo(() => {
    const term = searchTerm.toLowerCase()
  
    return historyData.filter((item) => {
      const startedAt = item.startedAt
        ? new Date(item.startedAt).toLocaleString().toLowerCase()
        : ''
  
      const finishedAt = item.finishedAt
        ? new Date(item.finishedAt).toLocaleString().toLowerCase()
        : ''
  
      const status = item.exeStatus?.toLowerCase() || ''
      const duration = item.duration?.toLowerCase() || ''
  
      const matchesSearch =
        startedAt.includes(term) ||
        finishedAt.includes(term) ||
        status.includes(term) ||
        duration.includes(term)
  
      const matchesStatus =
        statusFilter === 'All' || item.exeStatus === statusFilter
  
      return matchesSearch && matchesStatus
    })
  }, [historyData, searchTerm, statusFilter])
  

  const handleDownload = (item: IexecutiveJobListResponseBody) => {
    if (item.downloadLink) {
      window.open(item.downloadLink, '_blank')
    }
  }

  const handleResetFilter = () => {
    setSearchTerm('')
    setStatusFilter('All')
  }

  // Get unique statuses for filter dropdown
  // const statusOptions = ['All', ...Array.from(new Set(historyData.map((item) => item.exeStatus)))]

  const statusOptions = React.useMemo(
    () => ['All', ...Array.from(new Set(historyData.map(i => i.exeStatus).filter(Boolean)))],
    [historyData]
  )
  
  const columns = [
    {
      header: 'Started At',
      accessor: (row: IexecutiveJobListResponseBody) => (
        <span className="text-gray-700">
          {row.startedAt ? new Date(row.startedAt).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Finished At',
      accessor: (row: IexecutiveJobListResponseBody) => (
        <span className="text-gray-700">
          {row.finishedAt ? new Date(row.finishedAt).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: IexecutiveJobListResponseBody) => {
        const statusColors: Record<string, string> = {
          SUCCESS: 'bg-green-100 text-green-800',
          FAILED: 'bg-red-100 text-red-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
        }
        
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              statusColors[row.exeStatus] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {row.exeStatus}
          </span>
        )
      },
    },
    {
      header: 'Duration',
      accessor: (row: IexecutiveJobListResponseBody) => (
        <span className="text-gray-700">{row.duration || 'N/A'}</span>
      ),
    },
    {
      header: 'Download',
      width: '10rem',
      accessor: (row: IexecutiveJobListResponseBody) => (
        <Button
          variant="blue"
          size="sm"
          onClick={() => handleDownload(row)}
          disabled={!row.downloadLink || row.exeStatus !== 'SUCCESS'}
          className="flex items-center gap-2"
        >
          <BiDownload className="w-4 h-4" />
          Download
        </Button>
      ),
    },
  ]

  if (historyLoading) return <Loader />
  if (localError) return <div className="p-4 text-red-600">Error: {localError}</div>

  return (
    <div className="py-4">
      <Card className="shadow-md rounded-md">
        <CardHeader>
          <div className="flex justify-between items-center gap-4">
            <CardTitle className="text-lg font-bold flex-shrink-0">some name here </CardTitle>
            <div className="flex-1 max-w-lg">
              <Filter
                showSearchBox={true}
                showDropdown={true}
                showAcceptAll={false}
                showRejectAll={false}
                showExcelDownload={false}
                showPdfDownload={false}
                showResetFilter={true}
                showAdvancedSearch={false}
                searchPlaceholder="Search by date or status..."
                dropdownLabel="Status"
                dropdownOptions={statusOptions}
                searchValue={searchTerm}
                selectedOption={statusFilter}
                onSearchChange={(value) => setSearchTerm(value)}
                onDropdownChange={(value) => setStatusFilter(value)}
                onResetFilter={handleResetFilter}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  )
}

export default CommissionHistory

