import React, { useEffect, useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import type { IAgent } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { Switch } from '@/components/ui/switch'
import z from 'zod'
// import { BiIdCard } from 'react-icons/bi'
import DisplaySection from '../ui/displaySection'

const Training = ({ agent }: { agent: IAgent }) => {
  const [isEdit, setIsEdit] = useState(false) 
  // console.log('agent', agent)

  if (!agent) return null

  const agentForm = useAppForm({
    defaultValues: {
      branchCode: agent.branchCode,
      branchName: agent.branchName,
      confirmationDate: agent.confirmationDate,
      hRDoj: agent.hrDoj,
      fgValueTrngDate: agent.fgValueTrngDate,
      itSecPolicyTrngDate: agent.itSecPolicyTrngDate,
      npsTrngCompletionDate: agent.npsTrngCompletionDate,
      whistleBlowerTrngDate: agent.whistleBlowerTrngDate,
      govPolicyTrngDate: agent.govPolicyTrngDate,
      inductionTrngDate: agent.inductionTrngDate,
      incrementDate: agent.incrementDate,
      lastWorkingDate: agent.lastWorkingDate,
      lastPromotionDate: agent.lastPromotionDate,
      hSecPolicyTrngDate: agent.hSecPolicyTrngDate,
    },
    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })

  const organisationConfig = {
    gridCols: 3,
    defaultValues: {
       confirmationDate: agent.confirmationDate,
             incrementDate: agent.incrementDate,
                   lastPromotionDate: agent.lastPromotionDate,
                   hRDoj: agent.hrDoj,
                   lastWorkingDate: agent.lastWorkingDate,


     
    },
    schema: z.object({
      confirmationDate: z.string().optional(),
      incrementDate: z.string().optional(),
      lastPromotionDate: z.string().optional(),
      hRDoj: z.string().optional(),
      lastWorkingDate: z.string().optional(),
      
    }),

    fields: [
      {
        name: 'confirmationDate',
        label: 'Confirmation Date',
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
       
      },
      {
        name: 'incrementDate',
        label: 'Increment Date',
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
       
      },
      {
        name: 'lastPromotionDate',
        label: 'Last Promotion Date',
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
       
      },
      {
        name: 'hRDoj',
        label: 'HR Doj',
        type: 'date',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
       
      },
      {
        name: 'lastWorkingDate',
        label: 'Last Working Date',
        type: 'date',
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
  const branchConfig = {
    gridCols: 2,

    defaultValues: {
            branchCode: agent.branchCode,
      branchName: agent.branchName,
    },

    schema: z.object({
      branchCode: z.string().optional(),
      branchName: z.string().optional(),
    }),

    fields: [
      {
        name: 'branchCode',
        label: 'Branch Code',
        type: 'text',
        colSpan: 1,
        readOnly: !isEdit,
        variant: 'standard',
      },
      {
        name: 'branchName',
        label: 'Branch Name',
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

 const otherTrainingConfig = {
  gridCols: 3,

  defaultValues: {
    ic36TrngCompletionDate: agent.ic36TrngCompletionDate,
    sTrngCompletionDate: agent.sTrngCompletionDate,
    fgRockstarTrainingDate: agent.fgRockstarTrainingDate,
    fgValueTrngDate: agent.fgValueTrngDate,
    hSecPolicyTrngDate: agent.hSecPolicyTrngDate,
    itSecPolicyTrngDate: agent.itSecPolicyTrngDate,
    npsTrngCompletionDate: agent.npsTrngCompletionDate,
    whistleBlowerTrngDate: agent.whistleBlowerTrngDate,
    govPolicyTrngDate: agent.govPolicyTrngDate,
    inductionTrngDate: agent.inductionTrngDate,
  },

  schema: z.object({
    ic36TrngCompletionDate: z.string().optional(),
    sTrngCompletionDate: z.string().optional(),
    fgRockstarTrainingDate: z.string().optional(),
    fgValueTrngDate: z.string().optional(),
    hSecPolicyTrngDate: z.string().optional(),
    itSecPolicyTrngDate: z.string().optional(),
    npsTrngCompletionDate: z.string().optional(),
    whistleBlowerTrngDate: z.string().optional(),
    govPolicyTrngDate: z.string().optional(),
    inductionTrngDate: z.string().optional(),
  }),

  fields: [
    {
      name: 'ic36TrngCompletionDate',
      label: 'IC36 Trng Completion Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'sTrngCompletionDate',
      label: 'S Trng Completion Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'fgRockstarTrainingDate',
      label: 'FG Rockstar Training Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'fgValueTrngDate',
      label: 'FG Value Trng Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'hSecPolicyTrngDate',
      label: 'H Sec Policy Trng Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'itSecPolicyTrngDate',
      label: 'IT Sec Policy Trng Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'npsTrngCompletionDate',
      label: 'NPS Trng Completion Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'whistleBlowerTrngDate',
      label: 'Whistle Blower Trng Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'govPolicyTrngDate',
      label: 'Gov Policy Trng Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
    },
    {
      name: 'inductionTrngDate',
      label: 'Induction Trng Date',
      type: 'date',
      colSpan: 1,
      readOnly: !isEdit,
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
           Branch
          </h2>
          <div className="flex gap-2">
            <span className="font-medium text-gray-700">Edit</span>
            <Switch
              checked={isEdit}
              onCheckedChange={setIsEdit}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>

        <div className="flex gap-10">
     

          <Card className="bg-[#F2F2F7] w-full overflow-y-auto">
            <CardContent>
              <DynamicFormBuilder
                config={branchConfig}
                onSubmit={agentForm.handleSubmit}
              />

              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mt-6 font-poppins font-semibold text-[20px]">
           Organisation
          </h2>
        </div>
        <div className="flex gap-2">
          <Card className="bg-[#F2F2F7] w-full mt-5 max-h-[550px] overflow-y-auto overflow-x-hidden">
            <CardContent>
              <DynamicFormBuilder
                config={organisationConfig}
                onSubmit={agentForm.handleSubmit}
              />
              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl mt-6 font-semibold text-gray-900 mb-6 font-poppins font-semibold !text-[20px]">
          Other Training
        </h2>

        <Card className="bg-[#F2F2F7] w-full mt-5 max-h-[600px] overflow-y-auto">
          <CardContent>
            <DynamicFormBuilder
              config={otherTrainingConfig}
              onSubmit={agentForm.handleSubmit}
            />
            {/* some form inputs */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Training
