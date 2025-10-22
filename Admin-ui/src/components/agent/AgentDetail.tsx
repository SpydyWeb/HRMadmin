import React, { useState } from 'react'
import { BiCreditCard, BiMapPin, BiTargetLock, BiUser } from 'react-icons/bi'
import { FiTarget } from 'react-icons/fi'
import { Card, CardContent } from '../ui/card'
import DetailCard from './DetailCard'
import type { IAgent } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { FloatedTextFeild } from '../form/floated-text-field'
import EditSwitch from './EditSwitch'

const AgentDetail = ({ agent }: { agent: IAgent }) => {
  const [isEdit, setIsEdit] = useState(false) // ✅ Add state here

  console.log(agent);



  const agentForm = useAppForm({
    defaultValues: {
      agentCode: agent.agentCode,
      agentName: agent.agentName,
      email: agent.email,
      gender: agent.gender,
      maritalStatusCode: agent.maritalStatusCode,
      nationality: agent.nationality,
      panNumber: agent.panNumber,
      preferredLanguage: agent.preferredLanguage,
    },
    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })

  const f = agentForm as any;


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
                      <h3 className="font-semibold text-lg">{agent.agentName}</h3>
                      <p className="text-orange-100 text-sm">
                        AGENT CODE - {agent.agentCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>{' '}
          </Card>

          <div className='absolute right-20 top-55'>
            <EditSwitch isEdit={isEdit} setIsEdit={setIsEdit} />
          </div>

          <Card className="bg-gray-100 w-full max-h-[400px] overflow-y-auto">
            <CardContent>
              <f.AppForm>
                <div className="grid grid-cols-2 gap-4 w-full">

                  <f.AppField name="agentCode">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Code"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="agentName">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Name"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="email">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Email"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="gender">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Gender"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="maritalStatusCode">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Martial Status"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="nationality">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Nationality"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="panNumber">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Pan Number"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="preferredLanguage">
                    {({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
                      <FloatedTextFeild
                        label="Agent Preferred Language"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  {/* Repeat for other fields */}
                </div>

                {isEdit && (
                  <agentForm.Button
                    onClick={agentForm.handleSubmit}
                    className="mt-4"
                    size="lg"
                    variant="orange"
                  >
                    Save Changes
                  </agentForm.Button>
                )}
              </f.AppForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AgentDetail
