import React, { useCallback, useState } from 'react'
import { BiSearch } from 'react-icons/bi'
import { MdMonitor } from 'react-icons/md'
import { IoIosArrowRoundForward } from 'react-icons/io'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { IAgent } from '@/models/agent'
import { Card, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showToast } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/useAuth'
import ZoneList from '@/components/dashboard/ZoneList'
import DataTable from '@/components/table/DataTable'
import { agentService } from '@/services/agentService'
import { AgentConstants, CommonConstants } from '@/services/constant'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'

export default function SearchInterface() {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedZone, setSelectedZone] = useState('All Zone')

  const handleClick = (agentid: string) => {
    navigate({ to: '/search/$agentId', params: { agentId: agentid } })
  }
  const handleModuleClick = (route: string) => {
  if (route) {
    navigate({ to: route })
  }
}
  const moduleCards = [
    {
      id: 'hms',
      title: 'H.M.S',
      icon: MdMonitor,
      color: 'bg-blue-600 hover:bg-blue-700',
      isActive: true,
      route:'/search/dashboard'
    },
    {
      id: 'commissions',
      title: 'Commissions',
      icon: MdMonitor,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      isActive: false,
       route:'/search/commission'
    },
    {
      id: 'incentive',
      title: 'Incentive / Rewards',
      icon: MdMonitor,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      isActive: false,
    },
    {
      id: 'pms',
      title: 'PMS',
      icon: MdMonitor,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      isActive: false,
    },
    {
      id: 'invoices',
      title: 'Invoices',
      icon: MdMonitor,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      isActive: false,
    },
  ]

  const dynamicColumns = [
    {
      header: 'Agent ID',
      accessor: (row: any) => (
        <span
          onClick={() => handleClick(row.agentid)}
          className="text-blue-700 underline font-medium cursor-pointer"
        >
          {row.agentid}
        </span>
      ),
    },
    { header: 'Requested By', accessor: 'requestedby' },
    { header: 'Date', accessor: 'date' },
    { header: 'Current Branch', accessor: 'currentBranch' },
  ]
  const fetchAgents = useCallback(async () => {
    if (!searchQuery.trim()) return []
    const value = { searchCondition: searchQuery, zone: selectedZone }
    const response = await agentService.search(value)
    console.log("main response :-",response);
    const { errorCode, errorMessage } = response.responseHeader
    if (errorCode === CommonConstants.SUCCESS) {
      return response.responseBody.agents.map((agent: IAgent) => ({
        agentid: agent.agentCode,
        requestedby: agent.agentName,
        date: new Date(agent.createdDate).toLocaleDateString(),
        currentBranch: agent.businessName,
      }))
    } else if (errorCode === AgentConstants.AGENT_NOTFOUND) {
      throw new Error(errorMessage || 'No records found')
    } else {
      throw new Error(errorMessage || 'Unexpected error occurred')
    }
  }, [searchQuery, selectedZone])
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Please enter a search value')
      return
    }
    refetch()
  }
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['agents', searchQuery, selectedZone],
    queryFn: fetchAgents,
    enabled: false,
    retry: false,
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false,
  })

  return (
    <Card>
      <CardContent>
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Search Entities & Records
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Quickly find Agents, Branches, Cycles, and Requests across the
              system.
            </p>
            <p className="text-sm text-gray-500">
              Powered by :- {user ? user.username : ' Not Logged In'}
            </p>
          </div>
          <div className=" flex justify-center items-center  gap-4">
            {/* Search Input */}
            <div className="relative w-[500px]">
              {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BiSearch className="h-6 w-6 text-gray-400" />
              </div> */}
              <Input
                type="text"
                label=''
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Agent Code, Name, Mobile Number, Email, PAN"
                className="pr-24 py-5.5"
                variant='standardone'
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Button
                  variant="blue"
                  onClick={() => handleSearch()}
                  className={`"h-full  border-l-0 px-6 mt-2`}
                  size="sm"
                  disabled={isFetching}
                >
                  Search
                </Button>
              </div>
            </div>
            <ZoneList />
          </div>

          {/* Module Cards */}
          <div className="flex gap-3 justify-center">
            {moduleCards.map((module) => {
              const IconComponent = module.icon
              return (
                <div
                  key={module.id}
                  onClick={() => handleModuleClick(module.route)}
                  className="bg-gray-200 p-2 max-w-52 w-full rounded-md cursor-pointer hover:bg-[var(--brand-blue)] hover:text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-sm bg-white`}>
                        <IconComponent className={`h-4 w-4 text-gray-600`} />
                      </div>
                      <span className="font-medium text-sm">
                        {module.title}
                      </span>
                    </div>
                    <IoIosArrowRoundForward className={`h-6 w-6 `} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className={`mt-5 px-20 text-center `}>
          <DataTable
            columns={dynamicColumns}
            data={data || []}
            loading={isFetching}
            noDataMessage={error?.message || ''}
          />
        </div>
      </CardContent>
    </Card>
  )
}
