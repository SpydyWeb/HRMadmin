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
  bankName: agent.bankDetails?.bankName,
  ifscCode: agent.bankDetails?.ifsc,
  micrCode: agent.bankDetails?.micr,
  bankBranchName: agent.bankDetails?.branchName,
  bankAccountNo: agent.bankDetails?.accountNumber,
  bankAccountType: agent.bankDetails?.accountType,
  paymentMode: agent.bankDetails?.paymentMode,
  factoringHouse: agent.bankDetails?.factoringHouse,
  payeeName: agent.bankDetails?.accountHolderName,
},

    onSubmit: async ({ value }) => {
      console.log('Updated agent:', value)
    },
  })

  const financialConfig = {
    gridCols: 3,
    defaultValues: {
          bank: agent.bank,
    factoringHouse: agent.factoringHouse,
    payeeName: agent.payeeName,
    panNo: agent.panNo,
    bankName: agent.bankName,
    bankBranchName: agent.bankBranchName,
    bankAccountNo: agent.bankAccountNo,
    bankAccountType: agent.bankAccountType,
    micrCode: agent.micrCode,
    ifscCode: agent.ifscCode,
    paymentMode: agent.paymentMode,
    serviceTaxNo: agent.serviceTaxNo,
    },

    schema: z.object({
          bank: z.string().optional(),
  factoringHouse: z.string().optional(),
  payeeName: z.string().optional(),
  panNo: z.string().optional(),
  bankName: z.string().optional(),
  bankBranchName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankAccountType: z.string().optional(),
  micrCode: z.string().optional(),
  ifscCode: z.string().optional(),
  paymentMode: z.string().optional(),
  serviceTaxNo: z.string().optional(),
    }),

    fields: [
      {
    name: 'bank',
    label: 'IFS Bank',
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
    name: 'payeeName',
    label: 'Payee Name',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'panNo',
    label: 'PAN No',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'bankName',
    label: 'Bank Name',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'bankBranchName',
    label: 'Bank Branch Name',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'bankAccountNo',
    label: 'Bank Account No',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'bankAccountType',
    label: 'Bank Account Type',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'micrCode',
    label: 'MICR Code',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'ifscCode',
    label: 'IFSC Code',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'paymentMode',
    label: 'Payment Mode',
    type: 'text',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'serviceTaxNo',
    label: 'Service Tax No',
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
          <Card className="bg-white w-full overflow-y-auto">
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
