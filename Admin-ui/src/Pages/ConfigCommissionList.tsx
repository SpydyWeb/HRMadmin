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


const ConfigCommissionList: React.FC = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

    const encryptionEnabled = useEncryption()
    const keyReady = !!encryptionService.getHrm_Key()
    const canFetch = !encryptionEnabled || keyReady

   const {
      data: comissionConfigList,
      isLoading: configCommissionListLoading,
      isError: configCommissionListQueryError,
      error: configCommissionListQueryErrorObj,
    } = useQuery<any>({
      queryKey: ['config-commission-list'],
      enabled: canFetch,
      queryFn: () => commissionService.configCommissionList({} as any),
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      retry: 1,
    })

  // Extract data from API response following the same pattern as other commission components
  const dashboardData = comissionConfigList?.responseBody?.commissionConfig
  console.log('config commission list data:', dashboardData)

  // Filter data based on search term
  const apiData = dashboardData || []
  const filteredData = apiData.filter(
    (item: any) =>
      item.commissionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.triggerType?.toLowerCase().includes(searchTerm.toLowerCase())||
      item.conditions?.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    
      const loading = configCommissionListLoading
      if (loading) return <Loader />
      if (localError)
        return <div className="p-4 text-red-600">Error: {localError}</div>

  const columns = [
    {
      header: 'Enabled',
      width: '5rem',
      accessor: (row: any) => (
        <div className="w-fit">
          <Checkbox
            checked={row.enabled === true || row.enabled === 'true' || row.enabled === 1}
            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white"
          />
        </div>
      ),
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
    // {
    //   header: 'Enabled',
    //   accessor: (row: any) => (
    //     <Switch className="text-gray-700">{row.enabled}</Switch>
    //   ),
    // },

    {
      header: 'Actions',
      accessor: (_row: any) => (
        <div className='flex gap-2'>

       
       
         
            <Button
              variant="blue"
              onClick={() =>
                navigate({
                  to: RoutePaths.CONFIG_COMMISSION,
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
                // commissionName: _row.commissionName || '',
                commissionId:  _row.commissionConfigId || '',
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
              Page {page} / {Math.ceil(filteredData.length / 10)}
            </span>
            <Pagination
              totalPages={Math.ceil(filteredData.length / 10)}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConfigCommissionList

