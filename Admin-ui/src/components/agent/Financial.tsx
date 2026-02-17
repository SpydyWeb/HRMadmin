import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import { Switch } from '@/components/ui/switch'
import z from 'zod'
import { agentService } from '@/services/agentService'
import { MASTER_DATA_KEYS, NOTIFICATION_CONSTANTS } from '@/utils/constant'
import { showToast } from '@/components/ui/sonner'

type FinanceDetailProps = {
  agent: any
  getOptions: any
}

const Finance = ({ agent,getOptions }: FinanceDetailProps) => {
  const [isEdit, setIsEdit] = useState(false) // ✅ Add state here

console.log('agent in financial', agent)


  if (!agent) return null

  const financialConfig = {
    gridCols: 3,
    sectionName: 'bank_details',
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

  {
    name: 'accountNumber',
    label: 'Bank Account No',
    type: 'masked',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
  },
  {
    name: 'accountType',
    label: 'Bank Account Type',
    type: 'select',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
    options: getOptions(MASTER_DATA_KEYS.BANK_ACC_TYPE),
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
    type: 'select',
    colSpan: 1,
    readOnly: !isEdit,
    variant: 'standard',
    options: getOptions(MASTER_DATA_KEYS.PAYMENT_MODE),
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
              size: 'md',
            },
          ],
        }
      : null,
  }

  const handleSectionSubmit =
  (sectionName: string) => async (formData: Record<string, any>) => {
    console.log(`📝 Submitting ${sectionName}:`, formData)

    try {
      // Extract agentId from agent object (convert to lowercase for backend)
      const agentid = agent?.agentId
      if (!agentid) {
        throw new Error('Agent ID is missing. Cannot update agent details.')
      }

      // Transform formData to match API expected format with bankAccounts array
      const bankAccountData = {
        accountHolderName: formData.accountHolderName || '',
        accountNumber: formData.accountNumber || '',
        ifsc: formData.ifsc || '',
        micr: formData.micr || '',
        bankName: formData.bankName || '',
        branchName: formData.branchName || '',
        accountType: typeof formData.accountType === 'string' 
          ? parseInt(formData.accountType, 10) 
          : formData.accountType || 0,
        preferredPaymentMode: typeof formData.preferredPaymentMode === 'string'
          ? parseInt(formData.preferredPaymentMode, 10)
          : formData.preferredPaymentMode || 0,
        factoringHouse: formData.factoringHouse || '',
      }

      const payload = {
        bankAccounts: [bankAccountData],
      }

      console.log('📤 Sending payload:', payload)
 
      const response = await agentService.editAgent(payload as any, sectionName, agentid)
      console.log('✅ Update successful:', response)

      // You can add success notification here
      showToast(NOTIFICATION_CONSTANTS.SUCCESS, `${sectionName} updated successfully!`)
      setIsEdit(false) // Exit edit mode after successful save

      return response
    } catch (error) {
      console.error(`❌ Error updating ${sectionName}:`, error)
      showToast(NOTIFICATION_CONSTANTS.ERROR, `Failed to update ${sectionName}. Please try again.`)
      throw error // Re-throw to let the form handle the error state
    }
  }

  if (!agent) {
    return <div className="p-10 text-red-600">Agent not found</div>
  }
  return (
    <div className="bg-white p-10">
      <div className="mb-6">

        
        <div className="flex justify-between">

          <h2 className="text-xl font-semibold text-gray-900 mb-6 font-poppins font-semibold text-[20px]">
            Financial Details
          </h2>
          <div className="flex items-center gap-2">
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
                onSubmit={handleSectionSubmit(financialConfig.sectionName)}

              />

              {/* some form inputs here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Finance
