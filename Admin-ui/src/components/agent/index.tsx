import CustomTabs from '../CustomTabs'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import Button from '../ui/button'
import AgentDetail from './AgentDetail'
import { useEffect, useState } from 'react'
import ComingSoon from '../comming-soon'
import { Hierarchy } from './hierarchy'
import { agentService } from '@/services/agentService'
import Loader from '@/components/Loader'
import { useParams } from '@tanstack/react-router'
import encryptionService from '@/services/encryptionService'
import { useEncryption } from '@/store/encryptionStore'
import AuditLog from './AuditLog'
import Training from './Training'
import License from './License'

const tabs = [
  { value: 'personaldetails', label: 'Personal' },
  { value: 'peoplehierarchy', label: 'People Hierarchy' },
  { value: 'geographicalhierarchy', label: 'Geographical Hierarchy' },
  { value: 'partnersmapped', label: 'Partners Mapped' },
  { value: 'auditlog', label: 'Audit Log' }, // typo fixed
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

const Agent = () => {
  const [activeTab, setActiveTab] = useState('personaldetails')
  const [searchInput, setSearchInput] = useState('')
  const [agentData, setAgentData] = useState<AgentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Adjust the "from" path to your actual route, e.g. '/agent/$agentId'
  const { agentId } = useParams({ from: "/_auth/search/$agentId" }) as { agentId?: string }

  // Only fetch when encryption is ready (if encryption is enabled)
  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  useEffect(() => {
    let cancelled = false

    const fetchAgent = async () => {
      if (!canFetch) return
      setLoading(true)
      setError(null)
      try {
        const res = await agentService.searchbycode({
          searchCondition: '',
          zone: '',
          agentId: 0,
          agentCode: agentId ?? '', // ensure correct type expected by API
          pageNo: 1,
          pageSize: 10,
          sortColumn: '',
          sortDirection: 'asc',
        })
        if (!cancelled) setAgentData(res)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to fetch agent')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAgent()
    return () => {
      cancelled = true
    }
  }, [agentId, canFetch])

  if (loading) return <Loader />
  if (error) return <div className="text-red-500">Error: {error}</div>

  const firstAgent = agentData?.responseBody?.agents?.[0]

  return (
    <>
      <div className="space-y-2 my-6">
        <Label className="text-gray-500">Search Agent</Label>
        <div className="flex max-w-md relative">
          <Input
            type="text"
            value={searchInput}
            variant="standard"
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by Agent Code, Name, Mobile Number"
            className="w-full !pr-[9rem] !py-6"
          />
          <div className="absolute inset-y-0 right-1 pl-3 flex items-center">
            <Button
              variant="blue"
              size="sm"
              onClick={() => {
                // Trigger a search by code/name/phone if needed
                // e.g., refetch with searchInput or navigate to a new route
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
          <AgentDetail agent={firstAgent} />
        ) : (
          <div>No agent found.</div>
        )
      ) : activeTab === 'peoplehierarchy' ? (
        <Hierarchy Agent={firstAgent} />
      ) : activeTab === 'auditlog' ? (
        <AuditLog Agentcode={agentId||""} />
      ) : activeTab === 'training' ? (
        <Training agent={firstAgent} />
      ) : activeTab === 'licensedetails' ? (
        <License agent={firstAgent} />
      ) : (
        <ComingSoon />
      )}
    </>
  )
}

export default Agent