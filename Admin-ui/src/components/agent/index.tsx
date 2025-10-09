import { useLoaderData, useParams } from '@tanstack/react-router'
import CustomTabs from '../CustomTabs'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import Button from '../ui/button'
import AgentDetail from './AgentDetail'
import type { ApiResponse } from '@/models/api'
import type { ILoginResponseBody } from '@/models/authentication'
import { useState } from 'react'
import ComingSoon from '../comming-soon'
import { Hierarchy } from './hierarchy'

const tabs = [
  { value: 'personaldetails', label: 'Personal Details' },
  {
    value: 'peoplehierarchy',
    label: 'People Hierarchy',
  },
  { value: 'geographicalhierarchy', label: 'Geographical Hierarchy' },
  {
    value: 'partnersmapped',
    label: 'Partners Mapped',
  },
  {
    value: 'autditlog',
    label: 'Audit Log',
  },
  {
    value: 'licensedetails',
    label: 'License Details',
  },
  {
    value: 'financialdetails',
    label: 'Financial Details',
  },
  {
    value: 'entity360',
    label: 'Entity 360°',
  },
]

const Agent = () => {
  const [activeTab, setactiveTab] = useState('personaldetails')
  const agentdata = useLoaderData<
    ApiResponse<{ agents: ILoginResponseBody[] }>
  >({
    from: '/_auth/search/$agentId',
  })
  return (
    <>
      <div className="space-y-2 my-6">
        <Label className="text-gray-500">Search Agent</Label>
        <div className="flex max-w-md relative">
          <Input
            type="text"
            placeholder="Search by Agent Code, Name, Mobile Number"
            className="w-full  !pr-[9rem] !py-6 "
          />
          <div className="absolute  inset-y-0 right-1 pl-3 flex items-center">
            <Button variant="blue" size="sm">
              Search
            </Button>
          </div>
        </div>
      </div>
      <CustomTabs
        tabs={tabs}
        defaultValue="personaldetails"
        onValueChange={(value) => setactiveTab(value)}
      />
      {activeTab === 'personaldetails' ? (
        <AgentDetail agent={agentdata.responseBody.agents[0]} />
      ) : activeTab === 'peoplehierarchy' ? (
        <Hierarchy />
      ) : (
        <ComingSoon />
      )}
    </>
  )
}

export default Agent
