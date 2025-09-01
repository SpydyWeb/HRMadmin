import DataTable from './table/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Button from '@/components/ui/button'
import { RoutePaths } from '@/utils/constant'
import { useNavigate } from '@tanstack/react-router'

// Table data
const tableData = [
  {
    channel: 'Code Movement',
    pending: 12,
    updated: '2 hours ago',
    priority: 'Medium',
    path: RoutePaths.CODEMOVEMENT,
  },
  {
    channel: 'Certifications Update',
    pending: 2,
    updated: '3 hours ago',
    priority: 'High',
    path: RoutePaths.CERTIFICATIONUPDATE,
  },
  {
    channel: 'Termination',
    pending: 21,
    updated: '6 hours ago',
    priority: 'Critical',
    path: RoutePaths.TERMINATION,
  },
  {
    channel: 'New Entity Approval',
    pending: 53,
    updated: '5 hours ago',
    priority: 'Critical',
    path: '',
  },
  {
    channel: 'Query',
    pending: 1,
    updated: '5 hours ago',
    priority: 'Critical',
    path: '',
  },
]

// Utility to handle priority colors
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

export default function PendingActionsTable() {
  const navigate = useNavigate()

  // Proper handleRedirect function
  const handleRedirect = (path: string) => {
    if (!path) return
    navigate({ to: path })
  }

  const columns = [
    { header: 'Channel Name', accessor: 'channel' },
    {
      header: 'Pending Items',
      accessor: (row: any) => (
        <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 font-medium">
          {row.pending.toString().padStart(2, '0')}
        </span>
      ),
    },
    { header: 'Last Updated', accessor: 'updated' },
    {
      header: 'Priority',
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
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button variant="blue" onClick={() => handleRedirect(row.path)}>
          Process Now
        </Button>
      ),
    },
  ]

  return (
    <Card className="shadow-md rounded-md">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-semibold">Pending Actions</CardTitle>
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
      <CardContent>
        <DataTable columns={columns} data={tableData} />
      </CardContent>
    </Card>
  )
}
