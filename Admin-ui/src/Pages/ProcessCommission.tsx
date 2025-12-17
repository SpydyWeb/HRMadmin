import React, { useState } from 'react'
import { FaClipboardList, FaNetworkWired } from 'react-icons/fa6'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination } from '@/components/table/Pagination'
import { Link, useNavigate } from '@tanstack/react-router'
import { RoutePaths } from '@/utils/constant'
import { tableData } from '@/utils/utilities'
import { HiOutlineCodeBracketSquare } from 'react-icons/hi2'
import { FaPlus } from 'react-icons/fa6'
import { LuSquareUserRound } from 'react-icons/lu'
import { RxDownload, RxUpload } from 'react-icons/rx'

const tabs = [
  { value: 'new', label: 'Processed Record Log', icon: <FaNetworkWired /> },
  {
    value: 'movement',
    label: 'Hold Record',
    icon: <HiOutlineCodeBracketSquare />,
  },
  { value: 'pi', label: 'Adjustment History', icon: <LuSquareUserRound /> },
  {
    value: 'status',
    label: 'Approval History',
    icon: <MdOutlinePublishedWithChanges />,
  },
]



const ProcessCommission = () => {
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('All')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [page, setPage] = useState(1)
  // Add state to track the currently selected tab
  const [activeTab, setActiveTab] = useState('new')
  
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

  // Define different content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'new':
        return (
          <div className="flex gap-6 bg-white p-6 space-y-6">
            <div className='w-full space-y-3'>

           
            <div className="flex flex-row justify-between items-center">
              <h4 className="text-xl font-semibold">Processed Record Log</h4>
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
              {/* <Filter
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
              /> */}
            </div>
            <DataTable columns={columns} data={tableData} />
             </div>
             <div className='max-w-[26rem] w-full space-y-3'>
                <Card className="px-2 gap-0 rounded-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Processing steps</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-2">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <div
              key={index}
              className="flex items-center justify-start gap-3 rounded-md border border-gray-100 bg-gray-100 hover:bg-white hover:shadow-lg text-left p-3  shadow-sm transition cursor-pointer"
              onClick={action.onClick}
            >
              {/* <div className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-900 hover:border-blue-700 "> */}
                <Icon className="h-5 w-5 text-gray-700 hover:text-blue-700" />
              {/* </div> */}
              <div className='flex justify-between gap-3 w-full'>
                <div className="text-sm text-gray-800 font-normal">
                  {action.title}
                </div>
                <div className="text-xs text-gray-500">{action.subtitle}</div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
             </div>
            {/* <Card className="bg-[#F2F2F7] shadow-none border-none rounded-sm flex flex-row items-center justify-between px-6 py-4">
             
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Bulk Actions Available
                </h2>
                <p className="text-sm text-gray-500">
                  Process multiple entries at once using templates
                </p>
              </div>
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
            </Card> */}
          </div>
        )
      case 'movement':
        return (
          <div className="bg-white p-6 space-y-6">
            <div className="flex flex-row justify-between items-center">
              <h4 className="text-xl font-semibold">Hold Record</h4>
              <Filter
                searchPlaceholder="Enter Code ID"
                dropdownLabel="Movement Type"
                dropdownOptions={['All', 'Addition', 'Deletion', 'Modification']}
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
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Movement History
                </h2>
                <p className="text-sm text-gray-500">
                  View and track all code movements
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size={'sm'}>
                  <BiUser className="h-4 w-4" />
                  View Details
                </Button>
                <Button size={'sm'} variant="ghost">
                  <BsClock className="h-4 w-4" />
                  Movement History
                </Button>
              </div>
            </Card>
          </div>
        )
      case 'pi':
        return (
          <div className="bg-white p-6 space-y-6">
            <div className="flex flex-row justify-between items-center">
              <h4 className="text-xl font-semibold">Adjustment History</h4>
              <Filter
                searchPlaceholder="Enter PI Name"
                dropdownLabel="Change Type"
                dropdownOptions={['All', 'New PI', 'PI Transfer', 'PI Removal']}
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
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  PI Change Management
                </h2>
                <p className="text-sm text-gray-500">
                  Process and track PI changes
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="blue" size={'sm'}>
                  <FaClipboardList className="h-4 w-4" />
                  Process Changes
                </Button>
                <Button variant="outline" size={'sm'}>
                  <BiUser className="h-4 w-4" />
                  Individual Change
                </Button>
              </div>
            </Card>
          </div>
        )
      case 'status':
        return (
          <div className="bg-white p-6 space-y-6">
            <div className="flex flex-row justify-between items-center">
              <h4 className="text-xl font-semibold">Approval History</h4>
              <Filter
                searchPlaceholder="Enter Code ID"
                dropdownLabel="Status"
                dropdownOptions={['All', 'Active', 'Inactive', 'Pending', 'Expired']}
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
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Status Change Management
                </h2>
                <p className="text-sm text-gray-500">
                  Approve or reject status changes
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="blue" size={'sm'}>
                  <FaClipboardList className="h-4 w-4" />
                  Bulk Update
                </Button>
                <Button variant="outline" size={'sm'}>
                  <BiUser className="h-4 w-4" />
                  Individual Update
                </Button>
                <Button size={'sm'} variant="ghost">
                  <BsClock className="h-4 w-4" />
                  Status History
                </Button>
              </div>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="py-4">
      {/* Tabs and Filter Header */}
      <div className="flex flex-row justify-between items-center">
        <CustomTabs
          tabs={tabs}
          defaultValue="new"
          onValueChange={(value) => setActiveTab(value)}
        />
       
      </div>

      {/* Render different content based on the selected tab */}
      {renderTabContent()}

      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg text-gray-700">Page 1/6</span>
        <Pagination totalPages={4} currentPage={page} onPageChange={setPage} />
      </div>
    </div>
  )
}

export default ProcessCommission