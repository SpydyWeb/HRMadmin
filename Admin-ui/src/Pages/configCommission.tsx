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
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
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
import { ThirdStepCommissionConfig } from '@/components/commission/ThirdStepCommissionConfig'
import { FourthStepCommissionConfig } from '@/components/commission/FourthStepCommissionConfig'

const tabs = [
  { value: 'new', label: 'Name', icon: <FaNetworkWired /> },
  {
    value: 'movement',
    label: 'Formula',
    icon: <HiOutlineCodeBracketSquare />,
  },
  { value: 'pi', label: 'Schedule', icon: <LuSquareUserRound /> },
  {
    value: 'status',
    label: 'Status',
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
  const search = useSearch({ strict: false })
  const commissionConfigIdFromSearch = (search as any)?.commissionConfigId
  const isEditMode = !!commissionConfigIdFromSearch
  
  const [localError, setLocalError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('All')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [page, setPage] = useState(1)
  // Add state to track the currently selected tab
  const [activeTab, setActiveTab] = useState('new')
  const [commissionConfigId, setCommissionConfigId] = useState<number | null>(
    commissionConfigIdFromSearch ? Number(commissionConfigIdFromSearch) : null
  )
  const [editModeData, setEditModeData] = useState<any>(null)

  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  // Fetch commission config data when in edit mode
  const {
    data: commissionConfigData,
    isLoading: commissionConfigLoading,
  } = useQuery<any>({
    queryKey: ['config-commission-list'],
    enabled: canFetch && isEditMode,
    queryFn: () => commissionService.configCommissionList({} as any),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Extract and set edit mode data when available
  useEffect(() => {
    if (isEditMode && commissionConfigData?.responseBody?.commissionConfig) {
      const configList = commissionConfigData.responseBody.commissionConfig
      const foundConfig = configList.find(
        (config: any) => config.commissionConfigId === commissionConfigId
      )
      if (foundConfig) {
        setEditModeData(foundConfig)
      }
    }
  }, [isEditMode, commissionConfigData, commissionConfigId])

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

  const renderTabContent = () => {
  switch (activeTab) {
    case 'new':
      return (
        <FirstStepFormCommission
          commissionConfigId={commissionConfigId}
          initialData={editModeData}
          isEditMode={isEditMode}
          isLoading={commissionConfigLoading}
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
          initialData={editModeData}
          isEditMode={isEditMode}
          onSaveSuccess={() => {
            console.log("Save successful, moving to next step");
            goToNextStep();
          }}
        />
      )

    case 'pi':
      return (
        <ThirdStepCommissionConfig
          commissionConfigId={commissionConfigId || 0}
          initialData={editModeData}
          isEditMode={isEditMode}
          onSaveSuccess={goToNextStep}
        />
      )

    case 'status':
      return (
        <FourthStepCommissionConfig
        commissionConfigId={commissionConfigId || 0}
        onSaveSuccess={goToNextStep}
      />
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
          value={activeTab}
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