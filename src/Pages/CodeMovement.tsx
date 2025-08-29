import React, { useState } from 'react'
import { FaNetworkWired } from 'react-icons/fa6'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { HiOutlineCodeBracketSquare } from 'react-icons/hi2'
import { LuSquareUserRound } from 'react-icons/lu'
import { FiEye } from 'react-icons/fi'
import CustomTabs from '@/components/CustomTabs'
import { Button } from '@/components/ui/button'
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

const tabs = [
  { value: 'new', label: 'New Code Creation', icon: <FaNetworkWired /> },
  { value: 'movement', label: 'Movements in Existing Codes', icon: <HiOutlineCodeBracketSquare /> },
  { value: 'pi', label: 'PI Change in Code', icon: <LuSquareUserRound /> },
  { value: 'status', label: 'Change in Status', icon: <MdOutlinePublishedWithChanges /> },
]

const tableData = [
  { srno: 1, agentid: 'AG10F12', requestedby: 'Manan Kumar', date: '12 May 2025' },
  { srno: 2, agentid: 'BG10F12', requestedby: 'Jaydeep Sharma', date: '11 May 2025' },
  { srno: 3, agentid: 'FG10F12', requestedby: 'Jitendra Rathore', date: '10 May 2025' },
  { srno: 4, agentid: 'KJ10F12', requestedby: 'Vivek Choubey', date: '10 May 2025' },
  { srno: 5, agentid: 'KG10F12', requestedby: 'Jaydeep Sharma', date: '09 May 2025' },
  { srno: 6, agentid: 'MG10F12', requestedby: '12 July 2025', date: '08 May 2025' },
  { srno: 7, agentid: 'AG10F12', requestedby: 'Vivek Choubey', date: '07 May 2025' },
]

const CodeMovement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('All')
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const toggleRowSelection = (srno: number) => {
    setSelectedRows((prev) =>
      prev.includes(srno)
        ? prev.filter((rowId) => rowId !== srno)
        : [...prev, srno]
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
    },
    { header: 'Agent ID', accessor: 'agentid' },
    { header: 'Requested By', accessor: 'requestedby' },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <FiEye size={20} className="text-gray-700 cursor-pointer" />
          <Button
            variant="outline"
            className="text-red-500 border border-gray-500 bg-transparent text-sm"
          >
            Reject
          </Button>
          <Button
            className="text-white text-sm"
            style={{ backgroundColor: 'var(--brand-green)' }}
          >
            Approve
          </Button>
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
      </div>
    </div>
  )
}

export default CodeMovement
