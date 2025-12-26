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
import { HoldCommission } from '@/components/commission/HoldCommission'
import { AdjustCommission } from '@/components/commission/AdjustCommission'
import { ApproveCommission } from '@/components/commission/ApproveCommission'
import { FirstStepFormCommission } from '@/components/commission/FirstStepFormCommission'
import { SecondStepCommissionConfig } from '@/components/commission/SecondStepCommissionConfig'

const tabs = [
  { value: 'new', label: 'Step 1', icon: <FaNetworkWired /> },
  {
    value: 'movement',
    label: 'Step 2',
    icon: <HiOutlineCodeBracketSquare />,
  },
  { value: 'pi', label: 'Step 3', icon: <LuSquareUserRound /> },
  {
    value: 'status',
    label: 'Step 4',
    icon: <MdOutlinePublishedWithChanges />,
  },
]


type ConfigCommissionResponse = {
  responseBody?: {
    processedRecordsLog: any[]
  }
}


const ConfigCommission : React.FC = () => {

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
  const [commissionConfigId, setCommissionConfigId] = useState<number | null>(null);



    // const loading = processcommissionLoading
    // if (loading) return <Loader />
    // if (localError)
    //   return <div className="p-4 text-red-600">Error: {localError}</div>
  
    
const STEP_ORDER = ['new', 'movement', 'pi', 'status']

const goToNextStep = () => {
  const currentIndex = STEP_ORDER.indexOf(activeTab)
  if (currentIndex < STEP_ORDER.length - 1) {
    setActiveTab(STEP_ORDER[currentIndex + 1])
  }
}

  
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
  // const renderTabContent = () => {
  //   switch (activeTab) {
  //     case 'new':
  //       return (
        
  //   <FirstStepFormCommission/>
  //       )
  //     case 'movement':
  //       return (
  //        <HoldCommission/>
  //       )
  //     case 'pi':
  //       return (
  //        <AdjustCommission/>
  //       )
  //     case 'status':
  //       return (
  //       <ApproveCommission/>
  //       )
  //     default:
  //       return null
  //   }
  // }

  const renderTabContent = () => {
  switch (activeTab) {
    case 'new':
      return (
        <FirstStepFormCommission
          onSaveSuccess={(id:any) => {
             setCommissionConfigId(id)
            goToNextStep()
          }}
        />
      )

    case 'movement':
      return (
        <SecondStepCommissionConfig
          commissionConfigId={commissionConfigId || 0}
          onSaveSuccess={() => {
            console.log("Save successful, moving to next step");
            goToNextStep();
          }}
        />
      )

    case 'pi':
      return (
        <AdjustCommission
          onSaveSuccess={goToNextStep}
        />
      )

    case 'status':
      return (
        <ApproveCommission />
        // last step → no next step
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

      {/* <div className="flex justify-between items-center">
        <span className="font-semibold text-lg text-gray-700">Page 1/6</span>
        <Pagination totalPages={4} currentPage={page} onPageChange={setPage} />
      </div> */}
    </div>
  )
}

export default ConfigCommission