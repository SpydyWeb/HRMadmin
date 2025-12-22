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

interface HoldCommissionProps {
   responseBody?: {
    records: any[]
  }
}

const HoldCommission: React.FC<HoldCommissionProps> = () => {
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
      data: records,
      isLoading: holdcommissionLoading,
      isError: holdcommissionQueryError,
      error: holdcommissionQueryErrorObj,
    } = useQuery<HoldCommissionProps>({
      queryKey: ['hold-commission'],
      enabled: canFetch,
      queryFn: () => commissionService.holdCommission(),
      staleTime: 1000 * 60 * 60, // 1 hour
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: 1,
    })
  
    useEffect(() => {
        if (holdcommissionQueryError) {
          const msg =
            (holdcommissionQueryErrorObj as any)?.message ||
            'Failed to fetch commission hold data'
          setLocalError(msg)
        } else {
          console.log(holdcommissionQueryErrorObj)
          setLocalError(null)
        }
      }, [holdcommissionQueryError, holdcommissionQueryErrorObj])

  const dashboardData = records?.responseBody?.holdCommission
  console.log('hold', dashboardData)

    const loading = holdcommissionLoading
    if (loading) return <Loader />
    if (localError)
      return <div className="p-4 text-red-600">Error: {localError}</div>
  

    const tableData =dashboardData?.records ?? []
    console.log('hold table', tableData)

  const columns = [
    { header: 'AgentName',  accessor: (row: any) => row.agentName, },
      
      { header: 'Reason',  accessor: (row: any) => row.reason, },
      { header: 'Amount',  accessor: (row: any) => row.amount, },
      {
        header: 'Held On',
        accessor: (row: any) =>
        row.heldOn
          ? new Date(row.heldOn).toLocaleDateString()
          : '-',
        
      },
      { header: 'Status',  accessor: (row: any) => row.status, },
      {
        header: 'Actions',
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
             <Button variant="outline-red">Reject</Button>
            <Button variant="green">Approve</Button>
          </div>
        ),
      },
    ]
    const approveCards = [
  {
    id: "approve",
    title: "Approve",
    status: "Pending",
    description: "Approval is expiring today",
    primaryAction: "Approve Now",
    secondaryActions: ["Dismiss", "Action Now"],
    icon: "check",
    enabled: true,
  },
  {
    id: "correction",
    title: "Send for Correction",
    status: null,
    description: "Drag and drop your file here, or click to browse",
    subText: "Excel File Upload up to 50 MB",
    primaryAction: "Upload File",
    icon: "upload",
    enabled: true,
  },
  {
    id: "download",
    title: "Download Validated File",
    status: "Available",
    description: null,
    primaryAction: "Download",
    icon: "download",
    enabled: true,
  },
];
 const holdData = [
    {
      
      name: 'Amounts on Hold',
      value: dashboardData?.amountOnHold || 0,
      color: 'var(--brand-blue)',
    },
    {
      name: 'Currently on hold',
      value: dashboardData?.currentlyOnHold || 0,
      color: 'var(--brand-green)',
    },
    {
      name: 'Released this month',
      value: dashboardData?.releasedThisMonth || 0,
      color: 'var(--destructive)',
    },
  ]

  return (
      <div className="flex  gap-6">
     <div className="w-full bg-white p-6 space-y-6">
                 <CardHeader className="px-0">
                          <CardTitle className="text-lg font-semibold">
                           Hold Records
                          </CardTitle>
                        </CardHeader>
                         <CardContent className="grid grid-cols-1 md:grid-cols-3 mb-16 gap-8">
                                  {holdData.map((data, index) => (
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
          Upload Policy Adjustments
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
export { HoldCommission }
