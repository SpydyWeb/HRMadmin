import React, { useState } from 'react'
import { FaClipboardList, FaNetworkWired } from 'react-icons/fa6'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { HiOutlineCodeBracketSquare } from 'react-icons/hi2'
import { LuSquareUserRound } from 'react-icons/lu'
import { BiUser } from 'react-icons/bi'
import { BsClock } from 'react-icons/bs'
import CustomTabs from '@/components/CustomTabs'
import DataTable from '@/components/table/DataTable'
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
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/table/Pagination'
import { Link, useNavigate } from '@tanstack/react-router'
import { RoutePaths } from '@/utils/constant'
import { tableData } from '@/utils/utilities'

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

const HoldCommission = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('All')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [page, setPage] = useState(1)
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
    {
      header: 'Agent ID',
      accessor: (row: any) => (
        <Link to="" className="text-blue-700 underline font-medium">
          {row.agentid}
        </Link>
      ),
    },
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
            searchValue={searchTerm}
            selectedOption={selectedChannel}
            onSearchChange={(value) => setSearchTerm(value)}
            onDropdownChange={(value) => setSelectedChannel(value)}
            onResetFilter={() => {
              setSearchTerm('')
              setSelectedChannel('All')
              setSelectedRows([])
            }}
            onAdvancedToggle={() => console.log('Advanced search toggled')}
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
            <Button
              variant="blue"
              size={'sm'}
              onClick={() => navigate({ to: RoutePaths.BULKACTION })}
            >
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
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg text-gray-700">Page 1/6</span>
        <Pagination totalPages={4} currentPage={page} onPageChange={setPage} />
      </div>
    </div>
  )
}

export default HoldCommission
