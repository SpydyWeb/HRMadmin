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
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select'
import { useEffect, useState } from 'react'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { useQuery } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import Loader from '../Loader'
import { BiUser } from 'react-icons/bi'
import { BsClock } from 'react-icons/bs'
import { Check, Download, Eye, Upload } from 'lucide-react'

interface ApproveCommissionProps {
  responseBody?: {
    records: any[]
  }
}

const ApproveCommission: React.FC<ApproveCommissionProps> = () => {
  const actions: Array<ActionItem> = [
    {
      icon: FaPlus,
      title: 'Download Template',
      subtitle: 'Download',
      onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
    },
    {
      icon: FaPlus,
      title: 'Download Template',
      subtitle: 'Download',
      onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
    },
    {
      icon: FaPlus,
      title: 'Download Template',
      subtitle: 'Download',
      onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
    },
    {
      icon: FaPlus,
      title: 'Download Template',
      subtitle: 'Download',
      onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
    },
    {
      icon: FaPlus,
      title: 'Download Template',
      subtitle: 'Download',
      onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
    },
    {
      icon: FaPlus,
      title: 'Download Template',
      subtitle: 'Download',
      onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
    },
    {
      icon: LuSquareUserRound,
      title: 'Download Template',
      subtitle: 'Send',
      onClick: () => alert('Create Individually clicked'),
    },
    {
      icon: RxUpload,
      title: 'Download Template',
      subtitle: 'Send',
      onClick: () => alert('Export Hierarchy clicked'),
    },
    {
      icon: RxDownload,
      title: 'Download Template',
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
    isLoading: approvecommissionLoading,
    isError: approvecommissionQueryError,
    error: approvecommissionQueryErrorObj,
  } = useQuery<ApproveCommissionProps>({
    queryKey: ['approve-commission'],
    enabled: canFetch,
    queryFn: () => commissionService.approveCommission(),
    staleTime: 1000 * 60 * 60, // 1 hour
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  useEffect(() => {
    if (approvecommissionQueryError) {
      const msg =
        (approvecommissionQueryErrorObj as any)?.message ||
        'Failed to fetch commission approving data'
      setLocalError(msg)
    } else {
      setLocalError(null)
    }
  }, [approvecommissionQueryError, approvecommissionQueryErrorObj])
  const dashboardData = records?.responseBody?.approveCommission

  console.log('approve data', dashboardData)

  const loading = approvecommissionLoading
  if (loading) return <Loader />
  if (localError)
    return <div className="p-4 text-red-600">Error: {localError}</div>

  const tableData = dashboardData?.records ?? []
  console.log('approve dataTableData', tableData)

  const companyData = [
    {
      name: 'Total Amount Approved',
      value: dashboardData?.totalAmountApproved || 0,
      color: 'var(--brand-blue)',
    },
    {
      name: 'Total Records',
      value: dashboardData?.totalRecords || 0,
      color: 'var(--brand-green)',
    },
    {
      name: 'Pending Approval',
      value: dashboardData?.pendingApproval || 0,
      color: 'var(--destructive)',
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

  const columns = [
    {
      header: 'Date',
      accessor: (row: any) =>
        row.date ? new Date(row.date).toLocaleDateString() : '-',
    },
    { header: 'Period', accessor: (row: any) => row.period },
    { header: 'SubmittedBy', accessor: (row: any) => row.submittedBy },
    { header: 'Amount', accessor: (row: any) => row.amount },
    { header: 'Status', accessor: (row: any) => row.status },
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

  return (
    <div className="flex  gap-6">
      <div className="w-full bg-white p-6 space-y-6">
        <CardHeader className="px-0">
          <CardTitle className="text-lg font-semibold">
            Approval History
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 mb-16 gap-8">
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
        <Card className="rounded-md">
  <CardContent className="flex flex-col gap-4 p-4">
    {approveCards.map((item) => (
      <div
        key={item.id}
        className="flex items-center justify-between rounded-md bg-gray-50 p-4"
      >
        {/* Left Section */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 items-center justify-center rounded-md bg-indigo-100">
            {item.icon === "check" && <Check size={18} />}
            {item.icon === "upload" && <Upload size={18} />}
            {item.icon === "download" && <Download size={18} />}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {item.title}
              </span>

              {item.badge && (
                <span
                  className={`rounded px-2 py-[2px] text-xs font-medium ${item.badge.color}`}
                >
                  {item.badge.text}
                </span>
              )}
            </div>

            {item.infoText && (
              <p className="text-xs text-gray-500">{item.infoText}</p>
            )}

            {item.subText && (
              <p className="text-xs text-gray-500">{item.subText}</p>
            )}

            {item.hint && (
              <p className="text-[11px] text-gray-400">{item.hint}</p>
            )}

            {item.actions && (
              <div className="mt-1 flex gap-4 text-xs font-medium">
                <button className="text-red-500 hover:underline">
                  Dismiss
                </button>
                <button className="text-indigo-600 hover:underline">
                  Action Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Button */}
        <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100">
          {item.primaryBtn}
        </button>
      </div>
    ))}
  </CardContent>
</Card>
      </div>
    </div>
  )
}
export { ApproveCommission }
