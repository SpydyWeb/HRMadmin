import { ImArrowDown2, ImArrowUp2 } from 'react-icons/im'
import { MiniChart } from '../MiniChart'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { FaPlus } from 'react-icons/fa6'
import { LuSquareUserRound } from 'react-icons/lu'
import { RxDownload, RxUpload } from 'react-icons/rx'
import DataTable from '../table/DataTable'
import { RoutePaths } from '@/utils/constant'
import Button from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { ActionItem } from '@/utils/models'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select'
import { useEffect, useState } from 'react'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { useQuery, useMutation } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import Loader from '../Loader'
import { Pagination } from '@/components/table/Pagination'


// interface ProcessPgCommissionProps {
//    responseBody?: {
//     processedRecordsLog: any[]
//   }
// }

const ProcessPgCommission: React.FC<any> = () => {
        const actions: Array<ActionItem> = [
      {
        icon: FaPlus,
        title: "Download Template",
        subtitle: 'Download',
        onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
      },
      {
        icon: FaPlus,
        title: "Download Template",
        subtitle: 'Download',
        onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
      },
      {
        icon: FaPlus,
        title: "Download Template",
        subtitle: 'Download',
        onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
      },
      {
        icon: FaPlus,
        title: "Download Template",
        subtitle: 'Download',
        onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
      },
      {
        icon: FaPlus,
        title: "Download Template",
        subtitle: 'Download',
        onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
      },
      {
        icon: FaPlus,
        title: "Download Template",
        subtitle: 'Download',
        onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
      },
      {
        icon: LuSquareUserRound,
        title: "Download Template",
        subtitle: 'Send',
        onClick: () => alert('Create Individually clicked'),
      },
      {
        icon: RxUpload,
        title: "Download Template",
        subtitle: 'Send',
        onClick: () => alert('Export Hierarchy clicked'),
      },
      {
        icon: RxDownload,
        title: "Download Template",
        subtitle: 'Download',
        onClick: () => alert('Import Hierarchy clicked'),
      },
    ] 
  const navigate = useNavigate()
  const [page, setPage] = useState(1) // Page state starting from 1
  const [pageSize] = useState(10) // Default page size
  const [searchTerm, setSearchTerm] = useState('')
    const [localError, setLocalError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const encryptionEnabled = useEncryption()
      const keyReady = !!encryptionService.getHrm_Key()
      const canFetch = !encryptionEnabled || keyReady

  const {
      data: processedRecordsLog,
      isLoading: processcommissionLoading,
      isError: processcommissionQueryError,
      error: processcommissionQueryErrorObj,
    } = useQuery<any>({
      queryKey: ['process-commission', page, pageSize],
      enabled: canFetch,
      queryFn: () => commissionService.processCommission({ 
        pageNumber: page, // API uses 1-based indexing
        pageSize: pageSize
      }),
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      retry: 1,
    })
  
    useEffect(() => {
        if (processcommissionQueryError) {
          const msg =
            (processcommissionQueryErrorObj as any)?.message ||
            'Failed to fetch commission processing data'
          setLocalError(msg)
        } else {
          setLocalError(null)
        }
      }, [processcommissionQueryError, processcommissionQueryErrorObj])

  // Download record mutation
  const downloadMutation = useMutation({
    mutationFn: (jobExeHistId: number) => 
      commissionService.downloadRecord({ jobExeHistId }),
    onSuccess: (response) => {
      const fileDownload = response?.responseBody?.fileDownload
      if (fileDownload && fileDownload.fileBase64) {
        // Convert base64 to blob and download
        const byteCharacters = atob(fileDownload.fileBase64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: fileDownload.contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileDownload.fileName || 'commission.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        setDownloadingId(null)
      } else {
        console.error('No file data in response')
        alert('Failed to download file: No file data received')
        setDownloadingId(null)
      }
    },
    onError: (error: any) => {
      console.error('Download error:', error)
      alert(`Failed to download file: ${error?.message || 'Unknown error'}`)
      setDownloadingId(null)
    },
  })

  const handleDownload = (row: any) => {
    const jobExeHistId = row.jobExeHistId || row._jobExeHistId
    if (!jobExeHistId) {
      alert('No job execution history ID found')
      return
    }
    setDownloadingId(jobExeHistId)
    downloadMutation.mutate(jobExeHistId)
  }

  const dashboardData = processedRecordsLog?.responseBody?.processCommissionList
  // const dashboardData = processedRecordsLog?.responseBody?.processCommissionList
  console.log('!@#dashboardData', dashboardData)
  const paginationData = processedRecordsLog?.responseBody?.pagination || {}
  console.log('!@#paginationData', paginationData)


     const loading = processcommissionLoading
    if (loading) return <Loader />
    if (localError)
      return <div className="p-4 text-red-600">Error: {localError}</div>
  

    const dataTableData =dashboardData ?? []
    console.log('!@#dataTableData', dataTableData) 

    const handlePageChange = (newPage: number) => {
      console.log('Changing to page:', newPage)
      setPage(newPage)
    }

  const columns = [
      {
        header: 'Date',
        accessor: (row: any) =>
        row.startedAt
          ? new Date(row.startedAt).toLocaleDateString()
          : '-',
        width: '20%',
      },
      { 
        header: 'Commission Name',  
        accessor: (row: any) => row.commissionName,
        width: '20%',
      },
      { 
        header: 'Records', 
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            <span>{row.records}</span>
            <RxDownload 
              className={`h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer transition ${
                downloadingId === (row.jobExeHistId || row._jobExeHistId) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => {
                if (downloadingId === (row.jobExeHistId || row._jobExeHistId)) return
                handleDownload(row)
              }}
              title="Download records"
            />
          </div>
        ),
        width: '20%',
      },
      { 
        header: 'Status',  
        accessor: (row: any) => row.exeStatus,
        width: '20%',
      },
      {
        header: 'Actions',
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            <Button variant="outline-red" size="sm">Reject</Button>
            <Button variant="green" size="sm">Approve</Button>
          </div>
        ),
        width: '20%',
      },
    ]

  return (
    <div className="flex gap-6 bg-white p-6 space-y-6">
      <div className="w-full space-y-3">
        <div className="flex flex-row justify-between items-center">
          <h4 className="text-xl font-semibold">Processed Record Log</h4>
          <Select defaultValue="this-month">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={dataTableData} />
        <div className="flex justify-between items-center mt-4">
            <span className="font-semibold text-lg text-gray-700">
              Page {page} of {paginationData.totalPages } ({paginationData.totalItems} total items)
            </span>
            <Pagination
              totalPages={paginationData.totalPages}
              currentPage={page}
              onPageChange={handlePageChange}
            />
          </div>
      </div>
      <div className="max-w-[26rem] w-full space-y-3">
        <Card className="px-2 gap-0 rounded-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Processing steps
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-2">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <div
                  key={index}
                  className="flex items-center justify-start gap-3 rounded-md border border-gray-100 bg-gray-100 hover:bg-white hover:shadow-lg text-left p-3  shadow-sm transition cursor-pointer"
                  onClick={action.onClick}
                >
                  {/* <div className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-900 hover:border-blue-700 "> */}
                  <Icon className="h-5 w-5 text-gray-700 hover:text-blue-700" />
                  {/* </div> */}
                  <div className="flex justify-between gap-3 w-full">
                    <div className="text-sm text-gray-800 font-normal">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {action.subtitle}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export { ProcessPgCommission }
