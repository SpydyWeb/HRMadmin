import React from 'react'
import { BiCreditCard, BiMapPin, BiTargetLock, BiUser } from 'react-icons/bi'
import { FiTarget } from 'react-icons/fi'
import { Card, CardContent } from '../ui/card'
import DetailCard from './DetailCard'

const AgentDetail = ({agent}:any) => {

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Individual Agent Action
        </h2>

        <div className="flex gap-10">
          {/* Left Column - Agent Profile */}
          <Card className="bg-gray-100 w-lg">
            <CardContent>
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <img
                  src="/api/placeholder/300/300"
                  alt="Agent Profile"
                  className="aspect-3/2 object-cover mb-3 rounded-lg"
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAyMDBDMTAwIDE3Mi4zODYgMTIyLjM4NiAxNTAgMTUwIDE1MFMyMDAgMTcyLjM4NiAyMDAgMjAwVjIyMEgxMDBWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                  }}
                />

                {/* Agent Info Card */}
                <div className="bg-orange-400 text-white rounded-lg p-4 w-full max-w-xs">
                  <div className="flex items-center gap-3">
                    <BiUser className="h-8 w-8 text-white" />
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <p className="text-orange-100 text-sm">
                        AGENT CODE - {agent.agentid}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>{' '}
          </Card>

          <Card className="bg-gray-100 w-full">
            <CardContent className="space-y-8 ">
              {/* PAN and Region Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard
                  icon={<BiCreditCard className="h-6 w-6 text-green-600" />}
                  label="PAN"
                  value={agent.pan}
                />

                <DetailCard
                  icon={<BiTargetLock className="h-6 w-6 text-green-600" />}
                  label="Region"
                  value={agent.region}
                />
              </div>

              {/* Zone and Current Branch Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard
                  icon={<FiTarget className="h-6 w-6 text-green-600" />}
                  label="Zone"
                  value={agent.zone}
                />
                <DetailCard
                  icon={<BiMapPin className="h-6 w-6 text-green-600" />}
                  label="Current Branch"
                  value={agent.currentBranch}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AgentDetail
