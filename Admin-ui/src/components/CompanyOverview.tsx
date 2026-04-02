import { FiEye } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import  Button  from './ui/button'
import DataTable from './table/DataTable'
import { ApiResponse } from '@/models/api'
import { HMSService } from '@/services/hmsService'
import { useQuery } from '@tanstack/react-query'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { useMemo, useState } from 'react'
import { IChannelStatsApiResponse, IChannel, IChannelStatsResponseBody } from '@/models/hmsdashboard'
import { Pagination } from '@/components/table/Pagination'
import Loader from '@/components/Loader'
import { useNavigate } from '@tanstack/react-router'

type CompanyOverviewResponse = ApiResponse<IChannelStatsApiResponse>

const CompanyOverview = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1) 
  const [pageSize] = useState(10)
  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  const {
    data: companyOverviewData,
    isLoading: companyOverviewLoading,
    isError: companyOverviewQueryError,
  } = useQuery<CompanyOverviewResponse>({
    queryKey: ['hms-channel-stats', page, pageSize],
    enabled: canFetch,
    queryFn: () => HMSService.hmsOverviewStats({ pageNumber: page, pageSize }),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const responseBody: IChannelStatsResponseBody | undefined = useMemo(() => {
    if (!companyOverviewData) return undefined

    
    const raw: any = companyOverviewData.responseBody
    const candidate = raw?.responseBody ?? raw

    return candidate as IChannelStatsResponseBody | undefined
  }, [companyOverviewData])
  // console.log("channelStatsOverview", companyOverviewData)
  // console.log("responseBody", responseBody)


  const tableData = useMemo(() => responseBody?.channels ?? [], [responseBody])
  const paginationData = responseBody?.pagination

  const handlePageChange = (newPage: number) => {
    const totalPages = paginationData?.totalPages ?? 1
    const bounded = Math.min(Math.max(1, newPage), totalPages)
    setPage(bounded)
  }

  const handleAddNew = (row: IChannel) => {
    navigate({
      to: '/search/dashboard/create-individual',
      search: {
        channelId: row.channelId,
        channelName: row.channelName,
        channelCode: row.channelCode,
      },
    })
  }

  if (companyOverviewLoading) {
    return <Loader />
  }

  if (companyOverviewQueryError) {
    return (
      <Card className="shadow-md rounded-md">
        <CardContent className="flex items-center justify-center py-10">
          <span className="text-red-500">Failed to load company overview data</span>
        </CardContent>
      </Card>
    )
  }

  const columns = [
    {
      header: 'Channel Name',
      accessor: (row: IChannel) => (
        <span className="capitalize">{row.channelName}</span>
      ),
    },
    { header: 'Total Entities', accessor: 'totalEntities' },
    {
      header: 'Created',
      accessor: (row: IChannel) => (
        <span className="px-3 py-1 rounded-md bg-green-200 text-green-800 font-medium">
          {row.createdEntities}
        </span>
      ),
    },
    {
      header: 'Terminated',
      accessor: (row: IChannel) => (
        <span className="px-3 py-1 rounded-md bg-red-100 text-red-600 font-medium">
          {row.terminatedEntities}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: IChannel) => (
        <div className="flex items-center gap-3">
          <FiEye className="h-5 w-5 text-gray-700 cursor-pointer" />
          <Button variant='green' onClick={() => handleAddNew(row)}>
            Add New
          </Button>
        </div>
      ),
    },  
  ]

  return (
    <Card className="shadow-md rounded-md">
       <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl font-semibold">
         Channel Overview
          </CardTitle>
        </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={tableData} />
        <div className="flex justify-between items-center mt-4">
          <span className="font-semibold text-lg text-gray-700">
            Page {page} of {paginationData?.totalPages || 1} ({paginationData?.totalItems || tableData.length} total items)
          </span>
          <Pagination
            totalPages={paginationData?.totalPages || 1}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default CompanyOverview
