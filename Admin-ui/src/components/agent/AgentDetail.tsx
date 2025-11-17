import React, { useEffect, useState } from 'react'
import { BiCreditCard, BiMapPin, BiTargetLock, BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import type { IAgent } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { Switch } from '@/components/ui/switch'
import z from 'zod'

const AgentDetail = ({ agent }: { agent: IAgent }) => {
  const [isEdit, setIsEdit] = useState(false) // ✅ Add state here

  const genderOptions = ['Male', 'Female', 'Other']
  const genderDropdown = genderOptions.map((g) => ({
    label: g,
    value: g,
  }))

  if (!agent) return null

  const agentForm = useAppForm({
    defaultValues: {
      agentCode: agent.agentCode,
      agentTitle: agent.title,
      agentType: agent.agentTypeCode,
      agentID: agent.agentId,
      agentFirstName: agent.firstName,
      agentMiddleName: agent.middleName,
      agentLastName: agent.lastName,
      agentName: agent.agentName,
      email: agent.email,
      gender: agent.gender,
      maritalStatusCode: agent.maritalStatusCode,
      nationality: agent.nationality,
      panNumber: agent.panNumber,
      PanAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      preferredLanguage: agent.preferredLanguage,
      employeeCode: agent.employeeCode,
      FatherHusbandNm: agent.father_Husband_Nm,
      applicationDocketNo: agent.applicationDocketNo,
      candidateType: agent.candidateType,
      startDate: agent.startDate,
      appointmentDate: agent.appointmentDate,
      incorporationDate: agent.incorporationDate,
      agentTypeCategory: agent.agentTypeCategory,
      agentClassification: agent.agentClassification,
      cmsAgentType: agent.cmsAgentType,
      channel_Name: agent.channel_Name,
      sub_Channel: agent.sub_Channel,
    },
    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })

  const agentFormConfig = {
    gridCols: 3,
    defaultValues: {
      agentCode: agent.agentCode,
      agentTitle: agent.title,
      agentType: agent.agentTypeCode,
      agentID: agent.agentId,
      agentFirstName: agent.firstName,
      agentMiddleName: agent.middleName,
      agentLastName: agent.lastName,
      agentName: agent.agentName,
      email: agent.email,
      gender: agent.gender,
      maritalStatusCode: agent.maritalStatusCode,
      nationality: agent.nationality,
      panNumber: agent.panNumber,
      PanAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      preferredLanguage: agent.preferredLanguage,
      employeeCode: agent.employeeCode,
      FatherHusbandNm: agent.father_Husband_Nm,
      applicationDocketNo: agent.applicationDocketNo,
      candidateType: agent.candidateType,
      startDate: agent.startDate,
      appointmentDate: agent.appointmentDate,
      incorporationDate: agent.incorporationDate,
      agentTypeCategory: agent.agentTypeCategory,
      agentClassification: agent.agentClassification,
      cmsAgentType: agent.cmsAgentType,
      channel_Name: agent.channel_Name,
      sub_Channel: agent.sub_Channel,
    },
    schema: z.object({
      agentCode: z.string().optional(),
      employeeCode: z.string().optional(),
      agentID: z.string().optional(),
      applicationDocketNo: z.string().optional(),
      agentType: z.string().optional(),
      candidateType: z.string().optional(),
      startDate: z.string().optional(),
      appointmentDate: z.string().optional(),
      incorporationDate: z.string().optional(),
      agentTypeCategory: z.string().optional(),
      agentClassification: z.string().optional(),
      cmsAgentType: z.string().optional(),
    }),

    fields: [
      {
        name: 'agentCode',
        label: 'Agent Code',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'employeeCode',
        label: 'Employee Code',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentID',
        label: 'Agent Id',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'applicationDocketNo',
        label: 'Application Docket No',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentType',
        label: 'Agent Type',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'candidateType',
        label: 'Candidate Type',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'appointmentDate',
        label: 'Appointment Date',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'incorporationDate',
        label: 'Incorpation Date',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentTypeCategory',
        label: 'Agent Type Category',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentClassification',
        label: 'Agent Classification',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'cmsAgentType',
        label: 'CMS Agent Type',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
    ],

    buttons: isEdit
      ? {
          gridCols: 6,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 1,
              size: 'sm',
            },
          ],
        }
      : null,
  }
  const agentPersonalInfoConfig = {
    gridCols: 2,

    defaultValues: {
      agentTitle: agent.title,
      agentFirstName: agent.firstName,
      agentMiddleName: agent.middleName,
      agentLastName: agent.lastName,
      FatherHusbandNm: agent.father_Husband_Nm,
      gender: agent.gender,
      PanAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
    },

    schema: z.object({
      agentTitle: z.string().optional(),
      agentFirstName: z.string().optional(),
      agentMiddleName: z.string().optional(),
      agentLastName: z.string().optional(),
      FatherHusbandNm: z.string().optional(),
      gender: z.string().optional(),
      PanAadharLinkFlag: z.string().optional(),
      sec206abFlag: z.string().optional(),
    }),

    fields: [
      {
        name: 'agentTitle',
        label: 'Title',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentFirstName',
        label: 'First Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentMiddleName',
        label: 'Middle Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'agentLastName',
        label: 'Last Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'FatherHusbandNm',
        label: 'Father/Husband Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'gender',
        label: 'Agent Gender',
        type: 'select',
        options: genderDropdown,
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'PanAadharLinkFlag',
        label: 'Pan Aadhar Link Flag',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'sec206abFlag',
        label: 'Sec 206ab Flag',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
    ],

    buttons: isEdit
      ? {
          gridCols: 6,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 1,
              size: 'sm',
            },
          ],
        }
      : null,
  }

  const agentChannelConfig = {
    gridCols: 3,

    defaultValues: {
      channel_Name: agent.channel_Name,
      sub_Channel: agent.sub_Channel,
    },

    schema: z.object({
      channel_Name: z.string().optional(),
      sub_Channel: z.string().optional(),
    }),

    fields: [
      {
        name: 'channel_Name',
        label: 'Channel Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'sub_Channel',
        label: 'Sub Channel',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
    ],

    buttons: isEdit
      ? {
          gridCols: 6,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 1,
              size: 'sm',
            },
          ],
        }
      : null,
  }

  const f = agentForm as any

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Individual Agent Action
          </h2>
          <div className='flex gap-2'>
            <span className="font-medium text-gray-700">Edit</span>
            <Switch
              checked={isEdit}
              onCheckedChange={setIsEdit}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>
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
                    ;(e.target as HTMLImageElement).src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAyMDBDMTAwIDE3Mi4zODYgMTIyLjM4NiAxNTAgMTUwIDE1MFMyMDAgMTcyLjM4NiAyMDAgMjAwVjIyMEgxMDBWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                  }}
                />

                {/* Agent Info Card */}
                <div className="bg-orange-400 text-white rounded-lg p-4 w-full max-w-xs">
                  <div className="flex items-center gap-3">
                    <BiUser className="h-8 w-8 text-white" />
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">
                        {agent.agentName}
                      </h3>
                      <p className="text-orange-100 text-sm">
                        AGENT CODE - {agent.agentCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>{' '}
          </Card>

          <Card className="bg-gray-100 w-full  overflow-y-auto">
            <CardContent>
              <DynamicFormBuilder
                config={agentPersonalInfoConfig}
                onSubmit={agentForm.handleSubmit}
              />
              {/* <f.AppForm>
                <div className="grid grid-cols-2 gap-6 w-full mt-4">
                  <f.AppField name="agentTitle">
                    {({
                      value,
                      onChange,
                    }: {
                      value: string
                      onChange: (v: string) => void
                    }) => (
                      <FloatedTextFeild
                        label="Title"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="agentFirstName">
                    {({
                      value,
                      onChange,
                    }: {
                      value: string
                      onChange: (v: string) => void
                    }) => (
                      <FloatedTextFeild
                        label="First Name"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="agentMiddleName">
                    {({
                      value,
                      onChange,
                    }: {
                      value: string
                      onChange: (v: string) => void
                    }) => (
                      <FloatedTextFeild
                        label="Middle Name"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="agentLastName">
                    {({
                      value,
                      onChange,
                    }: {
                      value: string
                      onChange: (v: string) => void
                    }) => (
                      <FloatedTextFeild
                        label="Last Name"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="FatherHusbandNm">
                    {({
                      value,
                      onChange,
                    }: {
                      value: string
                      onChange: (v: string) => void
                    }) => (
                      <FloatedTextFeild
                        label="Father/Husband Name"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="gender">
                    {({
                      value,
                      onChange,
                    }: {
                      value: string
                      onChange: (v: string) => void
                    }) => (
                      <FloatedSelectField
                        label="Agent Gender"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                        options={genderDropdown}
                      />
                    )}
                  </f.AppField>

                  <f.AppField name="PanAadharLinkFlag">
                    {({
                      value,
                      onChange,
                    }: {
                      value: string
                      onChange: (v: string) => void
                    }) => (
                      <FloatedTextFeild
                        label="Pan Aadhar Link Flag"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
                  <f.AppField name="sec206abFlag">
                    {({
                      value,
                      onChange,
                    }: {
                      value: string
                      onChange: (v: string) => void
                    }) => (
                      <FloatedTextFeild
                        label="Sec 206ab Flag"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )}
                  </f.AppField>
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
              </f.AppForm> */}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6">
          Employment Details
        </h2>

        <Card className="bg-gray-100 w-full mt-5 max-h-[400px] overflow-y-auto">
          <CardContent>
            <DynamicFormBuilder
              config={agentFormConfig}
              onSubmit={agentForm.handleSubmit}
            />
            {/* <f.AppForm>
              <div className="grid grid-cols-3 gap-6 w-full mt-4">
                <f.AppField name="agentCode">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Agent Code"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>

                <f.AppField name="employeeCode">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Employee Code"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
                <f.AppField name="agentID">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Agent Id"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
                <f.AppField name="applicationDocketNo">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Application Docket No"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
                <f.AppField name="agentType">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Agent Type"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
                <f.AppField name="candidateType">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Candidate Type"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
                <f.AppField name="startDate">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => {
                    console.log('AppField → startDate value from form:', value)
                    return (
                      <FloatedTextFeild
                        label="Start Date"
                        value={value}
                        onChange={onChange}
                        readOnly={!isEdit}
                      />
                    )
                  }}
                </f.AppField>

                <f.AppField name="appointmentDate">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Appointment Date"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
                <f.AppField name="incorporationDate">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Incorpation Date"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
                <f.AppField name="agentTypeCategory">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Agent Type Category"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>

                <f.AppField name="agentClassification">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Agent Classification"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
      

                <f.AppField name="cmsAgentType">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="CMS Agent Type"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>

              
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
            </f.AppForm> */}
          </CardContent>
        </Card>
        <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6">
          Channel
        </h2>

        <Card className="bg-gray-100 w-full mt-5 max-h-[400px] overflow-y-auto">
          <CardContent>
            <DynamicFormBuilder
              config={agentChannelConfig}
              onSubmit={agentForm.handleSubmit}
            />
            {/* <f.AppForm>
              <div className="grid grid-cols-3 gap-6 w-full mt-4">
                <f.AppField name="channel_Name">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Channel Name"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
                <f.AppField name="sub_Channel">
                  {({
                    value,
                    onChange,
                  }: {
                    value: string
                    onChange: (v: string) => void
                  }) => (
                    <FloatedTextFeild
                      label="Sub Channel"
                      value={value}
                      onChange={onChange}
                      readOnly={!isEdit}
                    />
                  )}
                </f.AppField>
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
            </f.AppForm> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AgentDetail
