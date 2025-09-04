import React, { useState } from 'react'
import {
  Search,
  ChevronDown,
  FileText,
  DollarSign,
  Gift,
  Calendar,
  Receipt,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { MdMonitor } from 'react-icons/md'
import { IoIosArrowRoundForward } from 'react-icons/io'
import { Input } from '@/components/ui/input'

export default function SearchInterface() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZone, setSelectedZone] = useState('All Zone')

  const moduleCards = [
    {
      id: 'hms',
      title: 'H.M.S',
      icon: MdMonitor,
      color: 'bg-blue-600 hover:bg-blue-700',
      isActive: true,
    },
    {
      id: 'commissions',
      title: 'Commissions',
      icon: MdMonitor,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      isActive: false,
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
              Powered by :- Future Infotech
            </p>
          </div>
          <div className=" flex justify-center  gap-4">
            {/* Search Input */}
            <div className="flex min-w-2xl relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Agent Code, Name, Mobile Number, Email, PAN"
                className="w-full !pl-10 !pr-[9rem] !py-6 "
              />
                <div className="absolute  inset-y-0 right-1 pl-3 flex items-center">
              <Button variant="blue" className='px-10'>
                Search
              </Button>
              </div>
            </div>
            {/* Zone Dropdown */}
            <div className="relative">
              <button className="bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 min-w-[140px]">
                {selectedZone}
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Module Cards */}
          <div className="flex gap-3 justify-center">
            {moduleCards.map((module) => {
              const IconComponent = module.icon
              return (
                <div
                  key={module.id}
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
                    <IoIosArrowRoundForward
                      className={`h-6 w-6 `}
                    />
                  </div>
                </div>
              )
            })}
          </div>

        
        </div>
      </CardContent>
    </Card>
  )
}
