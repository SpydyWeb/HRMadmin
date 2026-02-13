// src/components/agent/index.tsx
import React, { useEffect, useState } from 'react'
import CustomTabs from '../CustomTabs'
import { Input } from '../ui/input'
import Button from '../ui/button'
import AgentDetail from './AgentDetail'
import ComingSoon from '../comming-soon'
import { Hierarchy } from './hierarchy'
import { GeographicalHierarchy } from './geographicalhierarchy'
import Loader from '@/components/Loader'
import { useParams, useNavigate } from '@tanstack/react-router'
import encryptionService from '@/services/encryptionService'
import { useEncryption } from '@/store/encryptionStore'
import AuditLog from './AuditLog'
import Training from './Training'
import License from './License'
import Financial from './Financial'
import { MASTER_DATA_KEYS } from '@/utils/constant'
import { useMasterData } from '@/hooks/useMasterData'
import { useQuery } from '@tanstack/react-query'
import { agentService } from '@/services/agentService'

const tabs = [
  { value: 'personaldetails', label: 'Personal' },
  { value: 'peoplehierarchy', label: 'People Hierarchy' },
  { value: 'geographicalhierarchy', label: 'Geographical Hierarchy' },
  { value: 'partnersmapped', label: 'Partners Mapped' },
  { value: 'auditlog', label: 'Audit Log' },
  { value: 'licensedetails', label: 'License' },
  { value: 'financialdetails', label: 'Financial' },
  { value: 'entity360', label: 'Entity 360°' },
  { value: 'training', label: 'Training' },
]

type AgentResponse = {
  responseBody?: {
    agents?: any[]
  }
}

const Agent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personaldetails')
  const [searchInput, setSearchInput] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const { agentId } = useParams({ from: '/_auth/search/$agentId' })
  const navigate = useNavigate()

  // encryption gating
  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  // master data hook (instant if loader prefetched + hydrated)
  const { getOptions, masterData, isLoading: masterLoading } = useMasterData(
    Object.values(MASTER_DATA_KEYS),
  )

  // Helper function to extract channel category from agent's channel value
  const getChannelCategory = (agent: any): string | null => {
    if (!agent?.channel) return null
    
    const channelItems = masterData[MASTER_DATA_KEYS.CHANNEL] || []
    // console.log("whatis the channel items", channelItems)
    const channelEntry = channelItems.find(
      (x: any) => (x.entryIdentity ?? x.id) === agent.channel
    )
    // console.log("whatis the channel entry", channelEntry)
    
    return channelEntry?.entryIdentity || null
  }

  const getBranchCode = (agent: any): string | null => {
    if (!agent?.branch) return null
    
    const branchItems = masterData[MASTER_DATA_KEYS.Office_Location] || []
    // console.log("whatis the channel items", channelItems)
    const branchEntry = branchItems.find(
      (x: any) => (x.entryIdentity ?? x.id) === agent.branch
    )
    // console.log("whatis the channel entry", channelEntry)
    
    return branchEntry?.entryIdentity || null
  }

  const getSubChannelCode = null

  // Agent query: same key & signature used by loader
  const {
    data: agentData,
    isLoading: agentLoading,
    isError: agentQueryError,
    error: agentQueryErrorObj,
  } = useQuery<AgentResponse>({
    queryKey: ['agent-search', agentId ?? ''],
    enabled: !!canFetch && !!agentId,
    queryFn: () =>
      agentService.searchbycode({
        searchCondition: '',
        zone: '',
        agentId: 0,
        agentCode: agentId ?? '',
        pageNo: 1,
        pageSize: 10,
        sortColumn: '',
        sortDirection: 'asc',
      }),
    staleTime: 1000 * 60 * 60, // 1 hour
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  useEffect(() => {
    if (agentQueryError) {
      setLocalError((agentQueryErrorObj as any)?.message ?? 'Failed to fetch agent')
    } else {
      setLocalError(null)
    }
  }, [agentQueryError, agentQueryErrorObj])

  const loading = masterLoading || agentLoading
  if (loading) return <Loader />
  if (localError) return <div className="p-4 text-red-600">Error: {localError}</div>

  const firstAgent = (agentData?.responseBody?.agents ?? [])[0] ?? null



  return (
    <>
      <div className="space-y-2 my-6">
        <div className="flex max-w-md relative">
          <Input
            type="text"
            value={searchInput}
            variant="outlined"
            onChange={(e) => {
              setSearchInput(e.target.value)
              setLocalError(null)
            }}
            placeholder="Search by Agent Code, Name, Mobile Number...."
            className="w-full !pr-[9rem] !py-6 bg-white"
            label=""
          />
          <div className="absolute inset-y-0 right-1 pl-3 flex items-center">
            <Button
              variant="blue"
              size="md"
              onClick={() => {
                // if (!searchInput) {
                //   setLocalError('Please enter an agent code to search')
                //   return
                // }

                // navigate({
                //   to: '/_auth/search/$agentId',
                //   params: { agentId: searchInput },
                // })
              }}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <CustomTabs
        tabs={tabs}
        defaultValue={activeTab}
        onValueChange={(value) => setActiveTab(value)}
      />

      {activeTab === 'personaldetails' ? (
        firstAgent ? (
          <AgentDetail agent={firstAgent} getOptions={getOptions} />
        ) : (
          <div className="p-4 text-gray-600">No agent found.</div>
        )
      ) : activeTab === 'peoplehierarchy' ? (
        <Hierarchy Agent={firstAgent} highlightAgentCode={agentId} />
      ) : activeTab === 'geographicalhierarchy' ? (
        firstAgent ? (
          <GeographicalHierarchy 
            Agent={firstAgent} 
            channelCode={getChannelCategory(firstAgent)}
            getOptions={getOptions}
            branchCode={getBranchCode(firstAgent)}
            subChannelCode={getSubChannelCode}
            highlightBranch={firstAgent?.branch}
            locationCode={firstAgent?.locationCode}
            officeType={firstAgent?.branchDesc}
          />
        ) : (
          <div className="p-4 text-gray-600">No agent found.</div>
        )
      ) : activeTab === 'auditlog' ? (
        <AuditLog Agentcode={agentId || ''} />
      ) : activeTab === 'training' ? (
        <Training agent={firstAgent} getOptions={getOptions}/>
      ) : activeTab === 'licensedetails' ? (
        <License agent={firstAgent} getOptions={getOptions} />
      ) : activeTab === 'financialdetails' ? (
        <Financial agent={firstAgent} getOptions={getOptions} />
      ) : (
        <ComingSoon />
      )}
    </>
  )
}

export default Agent
