import { FiEye } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import  Button  from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import DataTable from './table/DataTable'
import { ApiResponse } from '@/models/api'
import { HMSService } from '@/services/hmsService'
import { useQuery } from '@tanstack/react-query'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { useMemo } from 'react'
import { IChannelStatsApiResponse, IChannel, IChannelStatsResponseBody } from '@/models/hmsdashboard'

const columns = [
  { header: 'Channel Name', accessor: 'channelName' },
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
    accessor: () => (
      <div className="flex items-center gap-3">
        <FiEye className="h-5 w-5 text-gray-700 cursor-pointer" />
        <Button variant='green'>
          Add New
        </Button>
      </div>
    ),
  },  
]

type CompanyOverviewResponse = ApiResponse<IChannelStatsApiResponse>

const CompanyOverview = () => {
  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  const {
    data: companyOverviewData,
    isLoading: companyOverviewLoading,
    isError: companyOverviewQueryError,
  } = useQuery<CompanyOverviewResponse>({
    queryKey: ['hms-channel-stats'],
    enabled: canFetch,
    queryFn: () => HMSService.hmsOverviewStats(),
    staleTime: 1000 * 60 * 60,// 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Extract data from API response - responseBody contains IChannelStatsApiResponse, then its responseBody contains the actual data
  const channelStatsApiResponse = companyOverviewData?.responseBody
  const responseBody: IChannelStatsResponseBody | undefined = companyOverviewData?.responseBody
  // console.log("channelStatsOverview", companyOverviewData)
  // console.log("responseBody", responseBody)

  // Memoize company overview stats
  const companyStats = useMemo(() => [
    {
      name: 'Total Entities',
      value: responseBody?.totalEntities ?? 0,
      color: 'var(--brand-blue)'
    },
    {
      name: 'Active Entities',
      value: responseBody?.activeEntities ?? 0,
      color: 'var(--brand-green)'
    },
    {
      name: 'Terminated Entities',
      value: responseBody?.terminatedEntities ?? 0,
      color: 'var(--destructive)'
    },
  ], [responseBody])

  // Memoize table data from channels
  const tableData = useMemo(() => responseBody?.channels ?? [], [responseBody])

  if (companyOverviewLoading) {
    return (
      <Card className="shadow-md rounded-md">
        <CardContent className="flex items-center justify-center py-10">
          <span className="text-gray-500">Loading company overview...</span>
        </CardContent>
      </Card>
    )
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

  return (
    <Card className="shadow-md rounded-md">
      <CardContent>
          <Card className="bg-gray-100 px-0 py-3 gap-2 mb-5 rounded-md">
          <CardHeader className="flex flex-row justify-between items-center px-3">
            <CardTitle className="text-xl font-semibold">
              Company Overview
            </CardTitle>
            <Select defaultValue="this-month">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companyStats.map((data, index) => (
              <Card
                className="rounded-md p-5 flex-1 min-w-0 bg-white"
                key={index}
              >
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-600 mb-2">
                    {data.name}
                  </span>
                  <div
                    className={`text-2xl font-bold`}
                    style={{ color: data.color }}
                  >
                    {data.value}
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
        <DataTable columns={columns} data={tableData} />
      </CardContent>
    </Card>
  )
}

export default CompanyOverview
