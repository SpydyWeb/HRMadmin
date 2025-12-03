import React, { useEffect, useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import type { IAgent } from '@/models/agent'
import { useAppForm } from '@/components/form'
import { Switch } from '@/components/ui/switch'
import z from 'zod'

const License = ({ agent }: { agent: IAgent }) => {
  const [isEdit, setIsEdit] = useState(false) // ✅ Add state here

console.log('agent in financial', agent)

  if (!agent) return null

  const financialForm = useAppForm({

    defaultValues: {
  bankName: agent.bankAccounts?.[0]?.bankName,
  ifsc: agent.bankAccounts?.[0]?.ifsc,
  micr: agent.bankAccounts?.[0]?.micr,
  branchName: agent.bankAccounts?.[0]?.branchName,
  accountNumber: agent.bankAccounts?.[0]?.accountNumber,
  accountType: agent.bankAccounts?.[0]?.accountType,
  preferredPaymentMode: agent.bankAccounts?.[0]?.preferredPaymentMode,
  factoringHouse: agent.bankAccounts?.[0]?.factoringHouse,
  accountHolderName: agent.bankAccounts?.[0]?.accountHolderName,
},

    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })

  const financialConfig = {
    gridCols: 3,
    defaultValues: {
  bankName: agent.bankAccounts?.[0]?.bankName,
  ifsc: agent.bankAccounts?.[0]?.ifsc,
  micr: agent.bankAccounts?.[0]?.micr,
  branchName: agent.bankAccounts?.[0]?.branchName,
  accountNumber: agent.bankAccounts?.[0]?.accountNumber,
  accountType: agent.bankAccounts?.[0]?.accountType,
  preferredPaymentMode: agent.bankAccounts?.[0]?.preferredPaymentMode,
  factoringHouse: agent.bankAccounts?.[0]?.factoringHouse,
  accountHolderName: agent.bankAccounts?.[0]?.accountHolderName,
    },

    schema: z.object({
         bankName: z.string().optional(),
      ifsc: z.string().optional(),
      micr: z.string().optional(),
      branchName: z.string().optional(),
      accountNumber: z.string().optional(),
      AccountType: z.string().optional(),
      accountType: z.string().optional(),
      factoringHouse: z.string().optional(),
      accountHolderName: z.string().optional(),
      preferredPaymentMode: z.string().optional(),
    
    }),

    fields: [
      {
    name: 'bankName',
    label: 'Bank Name',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'factoringHouse',
    label: 'Factoring House',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'accountHolderName',
    label: 'Payee Name',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  // {
  //   name: 'panNo',
  //   label: 'PAN No',
  //   type: 'text',
  //   colSpan: 1,
  //   readOnly: !isEdit,
  //   variant: 'standard',
  // },
  {
    name: 'bankName',
    label: 'Bank Name',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },

  {
    name: 'accountNumber',
    label: 'Bank Account No',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'accountType',
    label: 'Bank Account Type',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'micr',
    label: 'MICR Code',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'ifsc',
    label: 'IFSC Code',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'preferredPaymentMode',
    label: 'Payment Mode',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  // {
  //   name: 'serviceTaxNo',
  //   label: 'Service Tax No',
  //   type: 'text',
  //   colSpan: 1,
  //   readOnly: !isEdit,
  //   variant: 'standard',
  // },
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
            },
          ],
        }
      : null,
  }

  // console.log("agentFormConfig", agentFormConfig)

  const f = financialForm as any

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">

        
        <div className="flex justify-between">

          <h2 className="text-xl font-semibold text-gray-900 mb-6 font-poppins font-semibold text-[20px]">
            License Details
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
        {/* license */}
        <div className="flex gap-10">
          <Card className="bg-[#F2F2F7] w-full overflow-y-auto">
            <CardContent>
              <DynamicFormBuilder
                config={financialConfig}
                onSubmit={financialForm.handleSubmit}
              />

              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default License
