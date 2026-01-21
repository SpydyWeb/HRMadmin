import React, { useEffect, useState } from 'react'
import DataTable from '@/components/table/DataTable'
import Button from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'
import { RoutePaths } from '@/utils/constant'
import { Pagination } from '@/components/table/Pagination'
import { useQuery } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import Loader from '@/components/Loader'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'
import lodash from 'lodash'
const { debounce } = lodash

const ConfigCommissionList: React.FC = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1) // Page state starting from 1
  const [pageSize] = useState(10) // Default page size
  const [searchTerm, setSearchTerm] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  // Create a debounced search function
  const debouncedSearch = debounce((value: string) => {
    // Reset to page 1 when searching
    setPage(1);
  }, 500);

  // Update the query to include page and pageSize in queryKey and pass them to the API
  const {
    data: comissionConfigList,
    isLoading: configCommissionListLoading,
    isError: configCommissionListQueryError,
    error: configCommissionListQueryErrorObj,
  } = useQuery<any>({
    queryKey: ['config-commission-list', page, pageSize, searchTerm], // Include searchTerm to trigger refetch when it changes
    enabled: canFetch,
    queryFn: () => commissionService.configCommissionList({ 
      pageNumber: page, // API uses 1-based indexing
      pageSize: pageSize
    }),
    staleTime: 1000 * 60 * 5, // Reduced to 5 minutes to ensure fresh data
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Extract data from API response
  const dashboardData = comissionConfigList?.responseBody?.commissionConfig || []
  const paginationData = comissionConfigList?.responseBody?.pagination || {}
  
  console.log('Current page:', page)
  console.log('API response page:', paginationData.currentPage)
  console.log('Dashboard data:', dashboardData)
  console.log('Full response:', comissionConfigList)

  // If API doesn't support search, filter on client side
  // But only if you're sure the API is properly paginating
  const filteredData = dashboardData.filter(
    (item: any) =>
      item.commissionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.triggerType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (configCommissionListQueryError) {
      const msg =
        (configCommissionListQueryErrorObj as any)?.message ||
        'Failed to fetch commission processing data'
      setLocalError(msg)
    } else {
      setLocalError(null)
    }
  }, [configCommissionListQueryError, configCommissionListQueryErrorObj])

  // Handle page change properly
  const handlePageChange = (newPage: number) => {
    console.log('Changing to page:', newPage)
    setPage(newPage)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const loading = configCommissionListLoading
  if (loading) return <Loader />
  if (localError)
    return <div className="p-4 text-red-600">Error: {localError}</div>

  const columns = [
    {
      header: 'Enabled',
      width: '5rem',
      accessor: (row: any) => {
        const isEnabled = row.enabled === true || row.enabled === 'true' || row.enabled === 1
        return (
          <div className="w-fit">
            {isEnabled ? (
              <Checkbox
                checked={true}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white"
              />
            ) : (
              <div className="h-4 w-4 rounded-sm border border-red-500 bg-red-500 flex items-center justify-center">
                <X className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Commission Name',
      accessor: (row: any) => (
        <span className="font-medium text-gray-900 upperCase">{row.commissionName}</span>
      ),
    },
    {
      header: 'From Date',
      accessor: (row: any) => (
        <span className="text-gray-700">{row.runFrom ? new Date(row.runFrom).toLocaleDateString() : 'N/A'}</span>
      ),
    },
    {
      header: 'To Date',
      accessor: (row: any) => (
        <span className="text-gray-700">{row.runTo ? new Date(row.runTo).toLocaleDateString() : 'N/A'}</span>
      ),
    },
    {
      header: 'Trigger Type',
      accessor: (row: any) => (
        <span className="text-gray-700">{row.triggerType}</span>
      ),
    },
    {
      header: 'Job Type',
      accessor: (row: any) => (
        <span className="text-gray-700">{row.jobType}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: (_row: any) => (
        <div className='flex gap-2'>
          <Button
            variant="blue"
            onClick={() =>
              navigate({
                to: RoutePaths.CONFIG_COMMISSION_NEW,
                search: {
                  commissionConfigId: _row.commissionConfigId || '',
                },
              })
            }
          >
            Edit 
          </Button>
          <Button
            variant="blue"
            onClick={() =>
              navigate({
                to: RoutePaths.COMMISSION_HISTORY,
                search: {
                  jobConfigId:  _row.jobConfigId || '',
                },
              })
            }
          >
            History
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="py-4">
      <Card className="shadow-md rounded-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold">
              Commission Configuration List
            </CardTitle>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                variant="blue"
                onClick={() => navigate({ to: RoutePaths.CONFIG_COMMISSION_NEW })}
              >
                New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredData} />
          <div className="flex justify-between items-center mt-4">
            <span className="font-semibold text-lg text-gray-700">
              Page {page} of {paginationData.totalPages || 1} ({paginationData.totalItems || 0} total items)
            </span>
            <Pagination
              totalPages={paginationData.totalPages || 1}
              currentPage={page}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConfigCommissionList