import React, { useEffect, useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import type { IAgent } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { Switch } from '@/components/ui/switch'
import z from 'zod'
import { User } from 'lucide-react'
import { changeLanguage } from 'i18next'
import { channel } from 'diagnostics_channel'
// import { BiIdCard } from 'react-icons/bi'

const AgentDetail = ({ agent }: { agent: IAgent }) => {
  const [isEdit, setIsEdit] = useState(false) // ✅ Add state here

  console.log('agent', agent)
  const genderOptions = ['Male', 'Female', 'Other']
  const genderDropdown = genderOptions.map((g) => ({
    label: g,
    value: g,
  }))

  if (!agent) return null

  const agentForm = useAppForm({
    defaultValues: {
      agentCode: agent.agentCode,
      title: agent.title,
      agentTypeCode: agent.agentTypeCode,
      agentId: agent.agentId,
      firstName: agent.firstName,
      middleName: agent.middleName,
      lastName: agent.lastName,
      agentName: agent.agentName,
      email: agent.email,
      gender: agent.gender,
      maritalStatusCode: agent.maritalStatusCode,
      nationality: agent.nationality,
      panNumber: agent.panNumber,
      panAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      preferredLanguage: agent.preferredLanguage,
      employeeCode: agent.employeeCode,
      father_Husband_Nm: agent.father_Husband_Nm,
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
      agentTypeCode: agent.agentTypeCode,
      agentId: agent.agentId,
      firstName: agent.firstName,
      middleName: agent.middleName,
      lastName: agent.lastName,
      agentName: agent.agentName,
      email: agent.email,
      gender: agent.gender,
      maritalStatusCode: agent.maritalStatusCode,
      nationality: agent.nationality,
      panNumber: agent.panNumber,
      panAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
      preferredLanguage: agent.preferredLanguage,
      employeeCode: agent.employeeCode,
      father_Husband_Nm: agent.father_Husband_Nm,
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
      agentId: z.string().optional(),
      applicationDocketNo: z.string().optional(),
      agentTypeCode: z.string().optional(),
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
        name: 'agentId',
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
        name: 'agentTypeCode',
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
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'appointmentDate',
        label: 'Appointment Date',
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'incorporationDate',
        label: 'Incorpation Date',
        type: 'date',
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
              size: 'lg',
              className:"mt-4"
            },
          ],
        }
      : null,
  }
  const agentPersonalInfoConfig = {
    gridCols: 3,

    defaultValues: {
      title: agent.title,
      firstName: agent.firstName,
      middleName: agent.middleName,
      lastName: agent.lastName,
      father_Husband_Nm: agent.father_Husband_Nm,
      gender: agent.gender,
    },

    schema: z.object({
      title: z.string().optional(),
      firstName: z.string().optional(),
      middleName: z.string().optional(),
      lastName: z.string().optional(),
      father_Husband_Nm: z.string().optional(),
      gender: z.string().optional(),
    }),

    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'middleName',
        label: 'Middle Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'father_Husband_Nm',
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
    ],

    buttons: isEdit
      ? {
          gridCols: 6,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 2,
              size: 'lg',
              className: 'whitespace-nowrap, mt-4',
            },
          ],
        }
      : null,
  }

  const agentChannelConfig = {
    gridCols: 2,

    defaultValues: {
      channel_Name: agent.channel_Name,
      sub_Channel: agent.sub_Channel,
      panAadharLinkFlag: agent.panAadharLinkFlag,
      sec206abFlag: agent.sec206abFlag,
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
        variant: 'custom',
      },
      {
        name: 'sub_Channel',
        label: 'Sub Channel',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
      },
      {
        name: 'panAadharLinkFlag',
        label: 'Pan Aadhar Link Flag',
        type: 'boolean',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
      },
      {
        name: 'sec206abFlag',
        label: 'Sec 206ab Flag',
        type: 'boolean',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'custom',
      },
    ],

    buttons: isEdit
      ? {
          gridCols: 4,
          items: [
            {
              label: 'Save Changes',
              type: 'submit',
              variant: 'orange',
              colSpan: 2,
              size: 'lg',
              className:"mt-4"
            },
          ],
        }
      : null,
  }

  // console.log("agentFormConfig", agentFormConfig)

  const f = agentForm as any

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 font-poppins font-semibold text-[20px]">
            Individual Agent Action
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700">Edit</span>
            <Switch
              checked={isEdit}
              onCheckedChange={setIsEdit}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>
        {/* -----------1st part------------------- */}

        <div className="flex gap-10">
          {/* Left Column - Agent Profile */}
          <Card className="bg-white w-lg bg-[#F2F2F7] !rounded-sm">
            <CardContent>
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <img
                  src="/person.jpg"
                  // src="/api/placeholder/300/300"
                  alt="Agent Profile"
                  className="aspect-3/2 object-cover mb-3 h-[12rem] rounded-lg"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAyMDBDMTAwIDE3Mi4zODYgMTIyLjM4NiAxNTAgMTUwIDE1MFMyMDAgMTcyLjM4NiAyMDAgMjAwVjIyMEgxMDBWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                  }}
                />

                {/* Agent Info Card */}
                <div className="bg-orange-400 text-white rounded-lg p-3 w-full max-w-xs">
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

          <Card className="flex justify-center items-center bg-white w-full  !m-0  p-4 w-[100%] !rounded-sm overflow-y-auto bg-[#F2F2F7] w-[100%]">
            <CardContent className='w-[100%] p-0'>
              <DynamicFormBuilder
                config={agentChannelConfig}
                onSubmit={agentForm.handleSubmit}
              />

              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>

        {/* --------------1st part----------------- */}

        {/* <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mt-6 font-poppins font-semibold text-[20px]">
            Employment Details
          </h2>
        </div> */}
        <div className="flex gap-2">
          <Card className="bg-white w-full !px-6 mt-5 overflow-y-auto overflow-x-hidden w-[100%]  bg-[#F2F2F7]">
            <CardContent className="!px-0 !py-0 w-[100%]">
              <DynamicFormBuilder
                config={agentFormConfig}
                onSubmit={agentForm.handleSubmit}
              />
              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>

        {/* <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6 font-poppins font-semibold !text-[20px]">
          Channel
        </h2> */}
        <div className="flex gap-2">
          <Card className="bg-white !px-1 w-full mt-5 overflow-y-auto bg-[#F2F2F7]">
            <CardContent>
              <DynamicFormBuilder
                config={agentPersonalInfoConfig}
                onSubmit={agentForm.handleSubmit}
              />
              {/* some form inputs */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AgentDetail
