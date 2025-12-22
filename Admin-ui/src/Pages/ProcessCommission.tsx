import React, { useEffect, useState } from 'react'
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
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { RoutePaths } from '@/utils/constant'
import { tableData } from '@/utils/utilities'
import { HiOutlineCodeBracketSquare } from 'react-icons/hi2'
import { FaPlus } from 'react-icons/fa6'
import { LuSquareUserRound } from 'react-icons/lu'
import { RxDownload, RxUpload } from 'react-icons/rx'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { useQuery } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import Loader from '@/components/Loader'
import { ProcessPgCommission } from '@/components/commission/ProcessPgCommission'
import { HoldCommission } from '@/components/commission/HoldCommission'
import { AdjustCommission } from '@/components/commission/AdjustCommission'
import { ApproveCommission } from '@/components/commission/ApproveCommission'

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

type ProcessCommissionResponse = {
  responseBody?: {
    processedRecordsLog: any[]
  }
}


const ProcessCommission : React.FC = () => {

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
    const [localError, setLocalError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('All')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [page, setPage] = useState(1)
  // Add state to track the currently selected tab
  const [activeTab, setActiveTab] = useState('new')


    // const loading = processcommissionLoading
    // if (loading) return <Loader />
    // if (localError)
    //   return <div className="p-4 text-red-600">Error: {localError}</div>
  

  
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
    // {
    //   header: (
    //     <Checkbox
    //       checked={selectedRows.length === tableData.length}
    //       onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
    //     />
    //   ),
    //   accessor: (row: any) => (
    //     <Checkbox
    //       checked={selectedRows.includes(row.srno)}
    //       onCheckedChange={() => toggleRowSelection(row.srno)}
    //     />
    //   ),
    //   width: '5rem',
    // },
    {
      header: 'Date',
      accessor: (row: any) =>
      row.processedDate
        ? new Date(row.processedDate).toLocaleDateString()
        : '-',
      
    },
    { header: 'Period',  accessor: (row: any) => row.period, },
    { header: 'Records', accessor: (row: any) => row.recordsCount, },
    { header: 'Status',  accessor: (row: any) => row.status, },
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

  // Define different content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'new':
        return (
    //       <div className="flex gap-6 bg-white p-6 space-y-6">
    //         <div className='w-full space-y-3'>

           
    //         <div className="flex flex-row justify-between items-center">
    //           <h4 className="text-xl font-semibold">Processed Record Log</h4>
    //            <Select defaultValue="this-month">
    //       <SelectTrigger className="w-40">
    //         <SelectValue placeholder="Select range" />
    //       </SelectTrigger>
    //       <SelectContent>
    //         <SelectItem value="this-month">This Month</SelectItem>
    //         <SelectItem value="last-month">Last Month</SelectItem>
    //         <SelectItem value="this-week">This Week</SelectItem>
    //       </SelectContent>
    //     </Select>
    //         </div>
    //         <DataTable columns={columns} data={dataTableData} />
    //          </div>
    //          <div className='max-w-[26rem] w-full space-y-3'>
    //             <Card className="px-2 gap-0 rounded-md">
    //   <CardHeader>
    //     <CardTitle className="text-xl font-semibold">Processing steps</CardTitle>
    //   </CardHeader>
    //   <CardContent className="flex flex-col gap-3 p-2">
    //     {actions.map((action, index) => {
    //       const Icon = action.icon
    //       return (
    //         <div
    //           key={index}
    //           className="flex items-center justify-start gap-3 rounded-md border border-gray-100 bg-gray-100 hover:bg-white hover:shadow-lg text-left p-3  shadow-sm transition cursor-pointer"
    //           onClick={action.onClick}
    //         >
    //           {/* <div className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-900 hover:border-blue-700 "> */}
    //             <Icon className="h-5 w-5 text-gray-700 hover:text-blue-700" />
    //           {/* </div> */}
    //           <div className='flex justify-between gap-3 w-full'>
    //             <div className="text-sm text-gray-800 font-normal">
    //               {action.title}
    //             </div>
    //             <div className="text-xs text-gray-500">{action.subtitle}</div>
    //           </div>
    //         </div>
    //       )
    //     })}
    //   </CardContent>
    // </Card>
    //          </div>
             
    //       </div>
    <ProcessPgCommission/>
        )
      case 'movement':
        return (
         <HoldCommission/>
        )
      case 'pi':
        return (
         <AdjustCommission/>
        )
      case 'status':
        return (
        <ApproveCommission/>
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