import React, { useState } from 'react'
import { FaClipboardList, FaNetworkWired } from 'react-icons/fa6'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { HiOutlineCodeBracketSquare } from 'react-icons/hi2'
import { LuSquareUserRound } from 'react-icons/lu'
import { FiEye } from 'react-icons/fi'
import CustomTabs from '@/components/CustomTabs'
import DataTable from '@/components/DataTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter } from '@/components/Filter'
import { Checkbox } from '@/components/ui/checkbox'
import Button from '@/components/ui/button'
import { BiUser } from 'react-icons/bi'
import { BsClock } from 'react-icons/bs'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/Pagination'
import { Link } from '@tanstack/react-router'

const tabs = [
  { value: 'new', label: 'New Code Creation', icon: <FaNetworkWired /> },
  {
    value: 'movement',
    label: 'Movements in Existing Codes',
    icon: <HiOutlineCodeBracketSquare />,
  },
  { value: 'pi', label: 'PI Change in Code', icon: <LuSquareUserRound /> },
  {
    value: 'status',
    label: 'Change in Status',
    icon: <MdOutlinePublishedWithChanges />,
  },
]

const tableData = [
  {
    srno: 1,
    agentid: 'AG10F12',
    requestedby: 'Manan Kumar',
    date: '12 May 2025',
    name: 'Rakesh Kumar',
    pan: 'QRSTU3456V',
    region: 'Delhi NCR',
    zone: 'North',
    currentBranch: 'Connaught Place',
    image: 'https://your-image-url.com/rakesh-kumar.jpg',
  },
  {
    srno: 2,
    agentid: 'BG10F12',
    requestedby: 'Jaydeep Sharma',
    date: '11 May 2025',
    name: 'Suresh Patel',
    pan: 'ABCDE1234F',
    region: 'Mumbai',
    zone: 'West',
    currentBranch: 'Andheri',
    image: 'https://your-image-url.com/suresh-patel.jpg',
  },
  {
    srno: 3,
    agentid: 'FG10F12',
    requestedby: 'Jitendra Rathore',
    date: '10 May 2025',
    name: 'Amit Verma',
    pan: 'FGHIJ5678K',
    region: 'Bangalore',
    zone: 'South',
    currentBranch: 'MG Road',
    image: 'https://your-image-url.com/amit-verma.jpg',
  },
  {
    srno: 4,
    agentid: 'KJ10F12',
    requestedby: 'Vivek Choubey',
    date: '10 May 2025',
    name: 'Vivek Choubey',
    pan: 'LMNOP9876Q',
    region: 'Delhi NCR',
    zone: 'North',
    currentBranch: 'Karol Bagh',
    image: 'https://your-image-url.com/vivek-choubey.jpg',
  },
  {
    srno: 5,
    agentid: 'KG10F12',
    requestedby: 'Jaydeep Sharma',
    date: '09 May 2025',
    name: 'Jaydeep Sharma',
    pan: 'RSTUV5432W',
    region: 'Pune',
    zone: 'West',
    currentBranch: 'Shivaji Nagar',
    image: 'https://your-image-url.com/jaydeep-sharma.jpg',
  },
  {
    srno: 6,
    agentid: 'MG10F12',
    requestedby: '12 July 2025',
    date: '08 May 2025',
    name: 'Manan Gupta',
    pan: 'WXYZA6789B',
    region: 'Hyderabad',
    zone: 'South',
    currentBranch: 'Banjara Hills',
    image: 'https://your-image-url.com/manan-gupta.jpg',
  },
  {
    srno: 7,
    agentid: 'AG10F12',
    requestedby: 'Vivek Choubey',
    date: '07 May 2025',
    name: 'Rakesh Kumar',
    pan: 'QRSTU3456V',
    region: 'Delhi NCR',
    zone: 'North',
    currentBranch: 'Connaught Place',
    image: 'https://your-image-url.com/rakesh-kumar.jpg',
  },
];


const CodeMovement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('All')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
 const [page, setPage] = useState(1);
  const toggleRowSelection = (srno: number) => {
    setSelectedRows((prev) =>
      prev.includes(srno)
        ? prev.filter((rowId) => rowId !== srno)
        : [...prev, srno],
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tableData.map((row) => row.srno))
    } else {
      setSelectedRows([])
    }
  }

  const columns = [
    {
      header: (
        <Checkbox
          checked={selectedRows.length === tableData.length}
          onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
        />
      ),
      accessor: (row: any) => (
        <Checkbox
          checked={selectedRows.includes(row.srno)}
          onCheckedChange={() => toggleRowSelection(row.srno)}
        />
      ),
      width: '5rem',
    },
    { header: 'Agent ID', accessor: (row: any) => (
       <Link to="" className="hover:text-blue-700 hover:underline">{row.agentid}</Link>
      ), },
    { header: 'Requested By', accessor: 'requestedby' },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <Button variant="outline-red">Reject</Button>
          <Button variant="green">Approve</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="py-4">
      {/* Tabs and Filter Header */}
      <div className="flex flex-row justify-between items-center">
        <CustomTabs
          tabs={tabs}
          defaultValue="new"
          onValueChange={(value) => console.log('Selected Tab:', value)}
        />
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

      {/* Table with Filters */}
      <div className="bg-white p-6 space-y-6">
        <div className="flex flex-row justify-between items-center">
          <h4 className="text-xl font-semibold">Code Movement</h4>
          <Filter
            searchPlaceholder="Enter Agent ID"
            dropdownLabel="Channel"
            dropdownOptions={['All', 'Email', 'Phone', 'Chat', 'Social Media']}
            allSelected={selectedRows.length === tableData.length}
            onSearchChange={(value) => setSearchTerm(value)}
            onDropdownChange={(value) => setSelectedChannel(value)}
            onResetFilter={() => {
              setSearchTerm('')
              setSelectedChannel('All')
              setSelectedRows([])
            }}
            onAdvancedSearch={() => console.log('Advanced search toggled')}
            onAcceptAll={() => console.log('Accept All clicked')}
            onRejectAll={() => console.log('Reject All clicked')}
            onExcelDownload={() => console.log('Excel download clicked')}
            onPdfDownload={() => console.log('PDF download clicked')}
            showAcceptAll={selectedRows.length > 1}
            showRejectAll={selectedRows.length > 1}
          />
        </div>
        <DataTable columns={columns} data={tableData} />
        <Card className="bg-[#F2F2F7] shadow-none border-none rounded-sm flex flex-row items-center justify-between px-6 py-4">
          {/* Left Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Bulk Actions Available
            </h2>
            <p className="text-sm text-gray-500">
              Process multiple entries at once using templates
            </p>
          </div>

          {/* Right Section */}
          <div className="flex gap-3">
            <Button variant="blue" size={'sm'}>
              <FaClipboardList className="h-4 w-4" />
              Bulk Action
            </Button>
            <Button variant="outline" size={'sm'}>
              <BiUser className="h-4 w-4" />
              Individual Action
            </Button>
            <Button size={'sm'} variant="ghost">
              <BsClock className="h-4 w-4" />
              Bulk History
            </Button>
          </div>
        </Card>
      </div>
      <div className='flex justify-between items-center'>
        <span className='font-semibold text-lg text-gray-700'>Page 1/6</span>
       <Pagination
        totalPages={4}
        currentPage={page}
        onPageChange={setPage}
      />
      </div>
    </div>
  )
}

export default CodeMovement
