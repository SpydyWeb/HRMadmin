import DynamicFormBuilder from '@/components/form/DynamicFormBuilder'
import { showToast } from '@/components/ui/sonner'
import { HMSService } from '@/services/hmsService'
import { CommonConstants } from '@/services/constant'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMasterData } from '@/hooks/useMasterData'
import { MASTER_DATA_KEYS } from '@/utils/constant'
import { useState } from 'react'

const CreateIndividual = () => {
  const [formRenderKey, setFormRenderKey] = useState(0)

  // master data hook (instant if loader prefetched + hydrated)
  const { getOptions } = useMasterData(Object.values(MASTER_DATA_KEYS))

  const createIndividualConfig = {
    gridCols: 3,
    fields: [
      {
        name: 'agentName',
        label: 'Agent Name',
        type: 'text',
        placeholder: 'Enter agent name',
        colSpan: 1,
        variant: 'standard',
      },
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        placeholder: 'Enter first name',
        colSpan: 1,
        variant: 'standard',
      },
      {
        name: 'middleName',
        label: 'Middle Name',
        type: 'text',
        placeholder: 'Enter middle name',
        colSpan: 1,
        variant: 'standard',
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Enter last name',
        colSpan: 1,
        variant: 'standard',
      },
      {
        name: 'mobileNo',
        label: 'Mobile Number',
        type: 'text',
        placeholder: 'Enter mobile number',
        colSpan: 1,
        variant: 'standard',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter email',
        colSpan: 1,
        variant: 'standard',
      },
      {
        name: 'panNumber',
        label: 'PAN Number',
        type: 'text',
        placeholder: 'Enter PAN number',
        colSpan: 1,
        variant: 'standard',
      },
      {
        name: 'channel',
        label: 'Channel',
        type: 'select',
        colSpan: 1,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.CHANNEL),
      },
      {
        name: 'subChannel',
        label: 'Sub Channel',
        type: 'select',
        colSpan: 1,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.SUB_CHANNELS),
      },
      {
        name: 'branch',
        label: 'Branch',
        type: 'select',
        colSpan: 1,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.Office_Location),
      },
      {
        name: 'locationCode',
        label: 'Location Code',
        type: 'select',
        colSpan: 1,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.Office_Type),
      },
      {
        name: 'designationCode',
        label: 'Designation Code',
        type: 'select',
        placeholder: 'Enter designation code',
        colSpan: 1,
        variant: 'standard',
        options: getOptions(MASTER_DATA_KEYS.DESIGNATION),
      },
      {
        name: 'supervisorCode',
        label: 'Supervisor Code',
        type: 'text',
        placeholder: 'Enter supervisor code',
        colSpan: 1,
        variant: 'standard',
      },
    ],
    buttons: {
      gridCols: 6,
      items: [
        {
          name: 'submit',
          label: 'Create Agent',
          type: 'submit',
          colSpan: 1,
          variant: 'blue',
          loadingText: 'Creating Agent...',
          size: 'md',
          className: 'whitespace-nowrap mt-4',
        },
      ],
    },
  }

  const handleCreateIndividualAgent = async (formData: Record<string, any>) => {
    try {
      const requiredFields = [
        'agentName',
        'firstName',
        'lastName',
        'mobileNo',
        'email',
        'panNumber',
        'channel',
        'branch',
        'locationCode',
        'designationCode',
        'supervisorCode',
      ]

      const missingField = requiredFields.find(
        (field) =>
          formData[field] === '' || formData[field] === null || formData[field] === undefined,
      )

      if (missingField) {
        showToast(NOTIFICATION_CONSTANTS.WARNING, 'Please fill all required fields')
        return
      }

      const payload = {
        agentName: String(formData.agentName).trim(),
        firstName: String(formData.firstName).trim(),
        middleName: formData.middleName ? String(formData.middleName).trim() : null,
        lastName: String(formData.lastName).trim(),
        mobileNo: String(formData.mobileNo).trim(),
        email: String(formData.email).trim(),
        panNumber: String(formData.panNumber).trim().toUpperCase(),
        channel: Number(formData.channel),
        subChannel:
          formData.subChannel === '' || formData.subChannel === null
            ? null
            : Number(formData.subChannel),
        branch: Number(formData.branch),
        locationCode: Number(formData.locationCode),
        designationCode: Number(formData.designationCode),
        supervisorCode: String(formData.supervisorCode).trim(),
      }

      const response: any = await HMSService.createIndividualAgent(payload)
      const errorCode = Number(response?.responseHeader?.errorCode)
      const errorMessage = response?.responseHeader?.errorMessage

      if (errorCode === CommonConstants.SUCCESS) {
        showToast(
          NOTIFICATION_CONSTANTS.SUCCESS,
          errorMessage || 'Agent created successfully.',
        )
        // Re-mount form to clear all entered values after successful create.
        setFormRenderKey((prev) => prev + 1)
        return
      }

      throw new Error(errorMessage || 'Failed to create agent')
    } catch (error: any) {
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        error?.message || 'Failed to create agent. Please try again.',
      )
    }
  }

  return (
    <div className="w-full px-6 py-4">
      <Card className="col-span-12 w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Create Individual Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicFormBuilder
            key={formRenderKey}
            config={createIndividualConfig}
            onSubmit={handleCreateIndividualAgent}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateIndividual
  