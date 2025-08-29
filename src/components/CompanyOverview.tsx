import { FiEye } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import DataTable from './DataTable'
const columns = [
  { header: 'Channel Name', accessor: 'channelName' },
  { header: 'Total Entities', accessor: 'totalEntities' },
  {
    header: 'Created',
    accessor: (row: any) => (
      <span className="px-3 py-1 rounded-md bg-green-200 text-green-800 font-medium">
        {row.created}
      </span>
    ),
  },
  {
    header: 'Terminated',
    accessor: (row: any) => (
      <span className="px-3 py-1 rounded-md bg-red-100 text-red-600 font-medium">
        {row.terminated}
      </span>
    ),
  },
  {
    header: 'Actions',
    accessor: (row: any) => (
      <div className="flex items-center gap-3">
        <FiEye className="h-5 w-5 text-gray-700 cursor-pointer" />
        <Button
          className=" text-white rounded-sm px-8"
          style={{ backgroundColor: 'var(--brand-blue)' }}
        >
          Add New
        </Button>
      </div>
    ),
  },  
]
const tableData = [
  {
    channelName: 'Digital Banking',
    totalEntities: 152,
    created: 53,
    terminated: 13,
  },
  {
    channelName: 'Retail Banking',
    totalEntities: 152,
    created: 53,
    terminated: 13,
  },
  {
    channelName: 'Corporate Banking',
    totalEntities: 152,
    created: 53,
    terminated: 13,
  },
  {
    channelName: 'Investment Services',
    totalEntities: 152,
    created: 53,
    terminated: 13,
  },
]
const companyData=[{
    name: 'Total Entities',
    value: 1523,
    color: 'var(--brand-blue)'
    },
    {
    name: 'Active Entities',
    value: 1340,
    color: 'var(--brand-green)'
    },
    {
    name: 'Terminated Entities',
    value: 183,
    color: 'var(--destructive)'
    },
   ]
const CompanyOverview = () => {
  return (
    <Card className="shadow-md rounded-md">
      <CardContent>
          <Card className="bg-gray-100 px-0 py-3 gap-2 mb-5 rounded-md">
          <CardHeader className="flex flex-row justify-between items-center px-3">
            <CardTitle className="text-xl font-semibold">
              Company Overview
            </CardTitle>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </Card>
        <DataTable columns={columns} data={tableData} />
      </CardContent>
    </Card>
  )
}

export default CompanyOverview
