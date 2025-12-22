import { ImArrowDown2, ImArrowUp2 } from 'react-icons/im'
import { MiniChart } from '../MiniChart'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { FaClipboardList, FaPlus } from 'react-icons/fa6'
import { LuSquareUserRound } from 'react-icons/lu'
import { RxDownload, RxUpload } from 'react-icons/rx'
import DataTable from '../table/DataTable'
import { RoutePaths } from '@/utils/constant'
import Button from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { ActionItem } from '@/utils/models'
import { Select } from 'react-day-picker'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select'
import { useEffect, useState } from 'react'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { useQuery } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import Loader from '../Loader'
import { BiUser } from 'react-icons/bi'
import { Check, Download, Upload } from 'lucide-react'

interface AdjustCommissionProps {
   responseBody?: {
    processedRecordsLog: any[]
  }
}

const AdjustCommission: React.FC<AdjustCommissionProps> = () => {
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
    const [localError, setLocalError] = useState<string | null>(null)

  const encryptionEnabled = useEncryption()
      const keyReady = !!encryptionService.getHrm_Key()
      const canFetch = !encryptionEnabled || keyReady

  const {
      data: adjustRecordsLog,
      isLoading: adjustcommissionLoading,
      isError: adjustcommissionQueryError,
      error: adjustcommissionQueryErrorObj,
    } = useQuery<AdjustCommissionProps>({
      queryKey: ['approve-commission'],
      enabled: canFetch,
      queryFn: () => commissionService.adjustCommission(),
      staleTime: 1000 * 60 * 60, // 1 hour
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: 1,
    })
  
    useEffect(() => {
        if (adjustcommissionQueryError) {
          const msg =
            (adjustcommissionQueryErrorObj as any)?.message ||
            'Failed to fetch commission adjust data'
          setLocalError(msg)
        } else {
          setLocalError(null)
        }
      }, [adjustcommissionQueryError, adjustcommissionQueryErrorObj])
  const dashboardData = adjustRecordsLog?.responseBody?.adjustCommission
  console.log('adjustment', dashboardData)

     const loading = adjustcommissionLoading
    if (loading) return <Loader />
    if (localError)
      return <div className="p-4 text-red-600">Error: {localError}</div>
  

    const tableData =dashboardData?.records ?? []
    console.log('adjustmentTableData', tableData) 

  const columns = [
          // { header: 'Approval Id',  accessor: (row: any) => row.approvalId, },
      {
        header: 'Date',
        accessor: (row: any) =>
        row.date
          ? new Date(row.date).toLocaleDateString()
          : '-',
        
      },
      { header: 'Period',  accessor: (row: any) => row.period, },
      { header: 'Adjustment',  accessor: (row: any) => row.submittedBy, },
      { header: 'uploaded by',  accessor: (row: any) => row.amount, },
      { header: 'Records', accessor: (row: any) => row.recordsCount, },
      // { header: 'Status',  accessor: (row: any) => row.status, },
      {
        header: 'Status',
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            <Button variant="outline-red">Reject</Button>
            <Button variant="green">Approve</Button>
          </div>
        ),
      },
    ]

 const companyData = [
    {
      name: 'Approved',
      value: dashboardData?.approved || 0,
      color: 'var(--brand-blue)',
    },
    {
      name: 'Pending Review',
      value: dashboardData?.pendingReview || 0,
      color: 'var(--brand-green)',
    },
    {
      name: 'Rejected',
      value: dashboardData?.rejected || 0,
      color: 'var(--destructive)',
    },
    {
      name: 'Total Records',
      value: dashboardData?.totalRecords || 0,
      color: 'var(--destructive)',
    },
  ]

  return (
      <div className="flex  gap-6">
   <div className="w-full bg-white p-6 space-y-6">
       <CardHeader className="px-0">
              <CardTitle className="text-lg font-semibold">
                Adjustment History
              </CardTitle>
            </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 mb-16 gap-8">
                      {companyData.map((data, index) => (
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

               <DataTable columns={columns} data={tableData} />
         
             </div>
               <div className="max-w-[18rem] w-full space-y-3">
                     <Card className="mx-auto w-full max-w-md rounded-md">
                           <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                             
                             {/* Upload Icon Box */}
                             <div className="flex h-16 w-16 items-center justify-center rounded-md bg-indigo-100">
                               <Upload className="h-7 w-7 text-gray-800" />
                             </div>
                     
                             {/* Title */}
                             <h2 className="text-lg font-semibold text-gray-900">
                               Upload TDS Adjustments
                             </h2>
                     
                             {/* Description */}
                             <div className="text-sm text-gray-500">
                               <p>Drag and drop your file here, or click to browse</p>
                               <p className="mt-1 text-xs">Excel File Upload up to 50 MB</p>
                             </div>
                     
                             {/* Upload Button */}
                             <button className="mt-2 rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                               Upload File
                             </button>
                     
                           </CardContent>
                         </Card>
                   </div>
             </div>
  )
}
export { AdjustCommission }
