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
import { FiExternalLink, FiUpload } from 'react-icons/fi'

// Table data
const tableData = [
  {
    Activity: 'Code Movement',
    Template: 'Download',
    Upload: '2 hours ago',
    Summary: '',
    Action: RoutePaths.CODEMOVEMENT,
  },
  {
    Activity: 'Certification Update',
    Template: 'Download',
    Upload: '2 hours ago',
    Summary: '',
    Action: RoutePaths.CODEMOVEMENT,
  },
  {
    Activity: 'Change in Status',
    Template: 'Download',
    Upload: '2 hours ago',
    Summary: '',
    Action: RoutePaths.CODEMOVEMENT,
  },
  {
    Activity: 'Manger Update',
    Template: 'Download',
    Upload: '2 hours ago',
    Summary: '',
    Action: RoutePaths.CODEMOVEMENT,
  },
  {
    Activity: 'Designation Update',
    Template: 'Download',
    Upload: '2 hours ago',
    Summary: '',
    Action: RoutePaths.CODEMOVEMENT,
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
    { header: 'Activity', accessor: 'Activity' },
    {
      header: 'Templates',
      accessor: (row: any) => (
        <button
          onClick={() => handleRedirect(row.downloadPath)}
          className="text-blue-600 underline hover:text-blue-800 font-medium"
        >
          Download
        </button>
      ),

    },
    {
      header: 'Upload',
      accessor: (row: any) => (
        <FiUpload className="text-gray-500 ml-4" onClick={() => handleRedirect(row.path)} />
      ),
    },
    { header: 'Summary', accessor: 'Summary' },
    {
      header: 'Action',
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
        <CardTitle className="text-xl font-semibold">Movement & Updation</CardTitle>
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
