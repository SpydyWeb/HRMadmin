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

  const columns = [
    { header: 'Cycle', accessor: 'channel' },
    {
      header: 'Rev()',
      accessor: (row: any) => (
        <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 font-medium">
          {row.pending.toString().padStart(2, '0')}
        </span>
      ),
    },
    {
      header: 'Comm()',
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

    // {
    //   header: 'Actions',
    //   accessor: (row: any) => (
    //     <Button variant="blue" onClick={() => handleRedirect(row.path)}>
    //       Process Now
    //     </Button>
    //   ),
    // },
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
  ]

  return (
    <div className="flex gap-6">
      <div className="w-full space-y-4">
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {buttons.map((data, id) => (
            <Button key={id} onClick={() => navigate({ to: data.path })}>
              {data.title}
            </Button>
          ))}
        </CardContent>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

        <Card className="shadow-md rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </Card>
      </div>

      <div className="max-w-[18rem] w-full space-y-3">
        <Card className="px-2 gap-0 rounded-md">
          <CardContent className="flex flex-col gap-3 p-2">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <div
                  key={index}
                  className="flex items-center justify-start gap-3 rounded-md border border-gray-100 bg-gray-100 hover:bg-white hover:shadow-lg text-left p-3  shadow-sm transition cursor-pointer"
                  onClick={action.onClick}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-900 hover:border-blue-700 ">
                    <Icon className="h-5 w-5 text-gray-700 hover:text-blue-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-800 font-bold">
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
        <Card className="px-2 gap-0  mb-2 rounded-md">
          <CardContent className="flex flex-col gap-3 p-2">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <div
                  key={index}
                  className="flex items-center justify-start gap-3 rounded-md border border-gray-100 bg-gray-100 hover:bg-white hover:shadow-lg text-left p-3  shadow-sm transition cursor-pointer"
                  onClick={action.onClick}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-900 hover:border-blue-700 ">
                    <Icon className="h-5 w-5 text-gray-700 hover:text-blue-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-800 font-bold">
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
export { CommissionCard }
