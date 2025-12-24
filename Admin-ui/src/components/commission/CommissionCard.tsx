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
import { Eye } from 'lucide-react'

interface CommissionCardProps {
  dashboardData: any
}

const CommissionCard: React.FC<CommissionCardProps> = ({ dashboardData }) => {
  const navigate = useNavigate()
  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'Medium':
        return 'bg-green-100 text-green-800'
      case 'High':
        return 'bg-purple-100 text-purple-800'
      case 'Critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const tableData = [
    {
      channel: 'Channel 1',
      pending: 300000,
      updated: '2 %',
      priority: '45,000',
      path: RoutePaths.CODEMOVEMENT,
    },
    {
      channel: 'Channel 2',
      pending: 7800000,
      updated: '3 %',
      priority: '34,000',
      path: RoutePaths.CERTIFICATIONUPDATE,
    },
    {
      channel: 'Channel 3',
      pending: 400000,
      updated: '6 %',
      priority: '90,000',
      path: RoutePaths.TERMINATION,
    },
  ]
  // Centralized data for reusability
  const metrics = [
    {
      title: 'Total Entities',
      value: '1250',
      change: '+120',
      changeType: 'positive',
      chartColor: '#10b981',
      chartData: [15, 18, 16, 22, 25, 28, 32, 35, 40],
    },
    {
      title: 'Created This Month',
      value: '152',
      change: '-10',
      changeType: 'negative',
      chartColor: '#ef4444',
      chartData: [35, 38, 42, 40, 38, 35, 32, 28, 25],
    },
    {
      title: 'Terminated This Month',
      value: '250',
      change: '+5',
      changeType: 'positive',
      chartColor: '#10b981',
      chartData: [20, 18, 19, 21, 20, 22, 23, 24, 25],
    },
    {
      title: 'Net Entity This Month',
      value: '48',
      change: '+5',
      changeType: 'positive',
      chartColor: '#10b981',
      chartData: [20, 18, 19, 21, 20, 22, 23, 24, 25],
    },
  ]
  const companyData = [
    {
      name: 'Commissioned Budget',
      value: 608,
      color: 'var(--brand-blue)',
    },
    {
      name: 'Commissioned Paid',
      value: 212,
      color: 'var(--brand-green)',
    },
    {
      name: 'Total Commissions on Hold',
      value: 54,
      color: 'var(--destructive)',
    },
  ]

  const actions: Array<ActionItem> = [
    {
      icon: FaPlus,
      title: 'Bulk Create Entity',
      subtitle: 'Create multiple entities at once',
      onClick: () => navigate({ to: RoutePaths.CREATEBULK }),
    },
    {
      icon: LuSquareUserRound,
      title: 'Create Individually',
      subtitle: 'Create a new entity',
      onClick: () => alert('Create Individually clicked'),
    },
    {
      icon: RxUpload,
      title: 'Export Hierarchy',
      subtitle: 'Export current hierarchy data',
      onClick: () => alert('Export Hierarchy clicked'),
    },
    {
      icon: RxDownload,
      title: 'Import Hierarchy',
      subtitle: 'Import hierarchy from file',
      onClick: () => alert('Import Hierarchy clicked'),
    },
  ]

  // const columns = [
  //   { header: 'Cycle', accessor: 'channel' },
  //   {
  //     header: 'Rev()',
  //     accessor: (row: any) => (
  //       <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 font-medium">
  //         {row.pending.toString().padStart(2, '0')}
  //       </span>
  //     ),
  //   },
  //   {
  //     header: 'Comm()',
  //     accessor: (row: any) => (
  //       <span
  //         className={`px-2 py-1 rounded-md font-medium ${priorityColor(
  //           row.priority,
  //         )}`}
  //       >
  //         {row.priority}
  //       </span>
  //     ),
  //   },
  //   { header: '%', accessor: 'updated' },

  //   // {
  //   //   header: 'Actions',
  //   //   accessor: (row: any) => (
  //   //     <Button variant="blue" onClick={() => handleRedirect(row.path)}>
  //   //       Process Now
  //   //     </Button>
  //   //   ),
  //   // },
  // ]
  const columns = [
  { header: 'Cycle', accessor: 'channel' },

  {
    header: 'Rev (₹)',
    accessor: (row: any) => (
      <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 font-medium">
        ₹{row.pending.toLocaleString()}
      </span>
    ),
  },

  {
    header: 'Comm (₹)',
    accessor: (row: any) => (
      <span
        className={`px-2 py-1 rounded-md font-medium ${priorityColor(
          row.priority,
        )}`}
      >
        {row.priority}
      </span>
    ),
  },

  { header: '%', accessor: 'updated' },
]
const mapToTableData = (list: any[]) =>
  (list || []).map((item: any) => ({
    channel: `Request ${item.requestId}`,
    pending: item.commissionAmount ?? 0,
    priority: item.status,
    updated: item.status === 'Pending' ? '—' : '100%',
    path: RoutePaths.PROCESS_COMMISSION,
  }))
const channelTables = [
  {
    title: 'Performance Snapshot',
    data: mapToTableData(dashboardData?.performanceSnapshot),
  },
  {
    title: 'Current Business Cycle',
    data: mapToTableData(dashboardData?.cycleCommissions),
  },
  {
    title: 'Renewal',
    data: mapToTableData(dashboardData?.renewalCommissions),
  },
  {
    title: 'On-Hold',
    data: mapToTableData(dashboardData?.adhocCommissions),
  },
]

  const forecastScenarios = [
  {
    id: 1,
    label: 'SCENARIO 1',
    type: 'OPTIMISTIC',
    amount: '₹12.5 Cr',
    description: 'Projected Commission',
    color: 'text-green-600',
  },
  {
    id: 2,
    label: 'SCENARIO 2',
    type: 'REALISTIC',
    amount: '₹10.8 Cr',
    description: 'Projected Commission',
    color: 'text-orange-500',
  },
  {
    id: 3,
    label: 'SCENARIO 3',
    type: 'PESSIMISTIC',
    amount: '₹9.2 Cr',
    description: 'Projected Commission',
    color: 'text-blue-600',
  },
]
 const downloadItems = [
  {
    id: 1,
    title: 'Commission Paid',
    period: 'Aug - 2025',
    type: 'COMMISSION_PAID',
    onClick: () => console.log('Download Commission Paid'),
  },
  {
    id: 2,
    title: 'TDS Paid',
    period: 'Aug - 2025',
    type: 'TDS_PAID',
    onClick: () => console.log('Download TDS Paid'),
  },
  {
    id: 3,
    title: 'GST Reports',
    period: 'Aug - 2025',
    type: 'GST_REPORTS',
    onClick: () => console.log('Download GST Reports'),
  },
  {
    id: 4,
    title: 'Agent Balances',
    period: 'Aug - 2025',
    type: 'AGENT_BALANCES',
    onClick: () => console.log('Download Agent Balances'),
  },
]
 const periodOptions = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Yearly', value: 'YEARLY' },
]

  const buttons = [
    {
      id: 1,
      title: 'Process Commission',
      path: RoutePaths.PROCESS_COMMISSION,
    },
    {
      id: 2,
      title: 'Hold Commission',
      path: RoutePaths.HOLD_COMMISSION,
    },
    {
      id: 3,
      title: 'Adjust Commission',
      path: RoutePaths.ADJUST_COMMISSION,
    },
    {
      id: 4,
      title: 'Approve Commission',
      path: RoutePaths.APPROVE_COMMISSION,
    },
    {
      id: 4,
      title: 'Config Commission',
      path: RoutePaths.CONFIG_COMMISSION,
    },
  ]

  return (
    <div className="flex gap-6">
      <div className="w-full space-y-4">
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
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Commission Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {buttons.map((data, id) => (
            <Button key={id} onClick={() => navigate({ to: data.path,state: data.state })}>
              {data.title}
            </Button>
          ))} 
        </CardContent>
    

        {/* <Card className="shadow-md rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardContent>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Channel</CardTitle>
              <DataTable columns={columns} data={tableData} />
            </CardHeader>
          </CardContent>
          <CardContent>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Channel</CardTitle>
              <DataTable columns={columns} data={tableData} />
            </CardHeader>
          </CardContent>
          <CardContent>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Channel</CardTitle>
              <DataTable columns={columns} data={tableData} />
            </CardHeader>
          </CardContent>
          <CardContent>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Channel</CardTitle>
              <DataTable columns={columns} data={tableData} />
            </CardHeader>
          </CardContent>
        </Card> */}
        <Card className="shadow-md rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
  {channelTables.map((table, index) => (
    <CardContent key={index}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          {table.title}
        </CardTitle>
      </CardHeader>

      <DataTable columns={columns} data={table.data} />
    </CardContent>
  ))}
</Card>

      </div>

      <div className="max-w-[18rem] w-full space-y-3">
        <Card className="rounded-md">
  <CardContent className="flex flex-col gap-3 px-3">
    {forecastScenarios.map((item, index) => (
      <div
        key={index}
        className="rounded-md bg-gray-100 p-3 shadow-sm"
      >
        {/* Scenario label */}
        <div className="text-[10px] font-semibold text-gray-500 uppercase">
          {item.label} -{' '}
          <span className={item.color}>{item.type}</span>
        </div>

        {/* Amount */}
        <div className="text-xl font-bold text-gray-900 mt-1">
          {item.amount}
        </div>

        {/* Description */}
        <div className="text-xs text-gray-500">
          {item.description}
        </div>
      </div>
    ))}

    {/* View Details Button */}
    <button className="mt-2 flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
      <Eye size={16} /> View Forecast Details
    </button>
  </CardContent>
</Card>

      <Card className="rounded-md mb-2">
  <CardContent className="flex flex-col gap-3 p-3">
    {/* Header */}
    <div className="text-sm font-bold text-gray-900">
      Downloads
    </div>

    {/* Period Dropdown */}
    <select className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500">
      <option>Period - Monthly</option>
      <option>Period - Quarterly</option>
      <option>Period - Yearly</option>
    </select>

    {/* Download Items */}
    {downloadItems.map((item, index) => (
      <div
        key={index}
        onClick={item.onClick}
        className="flex items-center justify-between rounded-md bg-gray-100 p-3 shadow-sm hover:bg-white hover:shadow-md transition cursor-pointer"
      >
        {/* Left content */}
        <div>
          <div className="text-sm font-semibold text-gray-800">
            {item.title}
          </div>
          <div className="text-xs text-gray-500">
            {item.period}
          </div>
        </div>

        {/* Download icon */}
        <div className="text-gray-600 hover:text-indigo-600">
          ⬇️
        </div>
      </div>
    ))}
  </CardContent>
</Card>

      </div>
    </div>
  )
}
export { CommissionCard }
