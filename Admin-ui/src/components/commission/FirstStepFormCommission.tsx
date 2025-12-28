import { useEffect, useState } from 'react'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { useQuery } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import Loader from '../Loader'
import { IConfigCommissionRequest } from '@/models/commission'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import { z } from 'zod'


interface FirstStepFormCommissionProps {
  responseBody?: {
    processedRecordsLog: any[]
  }
  onSaveSuccess: (id: number) => void
}


const FirstStepFormCommission: React.FC<FirstStepFormCommissionProps> = ({  onSaveSuccess}) => {
  const [formValues, setFormValues] = useState<IConfigCommissionRequest>({
    commissionName: '',
    triggerCycle: 'daily',
    runFrom: '',
    runTo: '',
  })
  const [localError, setLocalError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (key: keyof IConfigCommissionRequest, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

   const formatDateToISO = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  }


 const commissionStepOneFormConfig = {
    gridCols: 2,
    schema: z.object({
      commissionName: z.string().min(1),
      triggerCycle: z.string(),
      runFrom: z.string(),
      runTo: z.string(),
    }),
    fields: [
      {
        name: 'commissionName',
        label: 'Commission Name',
        type: 'text',
        colSpan: 1,
        variant: 'standard',
      },
      {
        name: 'triggerCycle',
        label: 'Trigger Cycle',
        type: 'select',
        colSpan: 1,
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
        ],
      },
      { name: 'runFrom', label: 'Run From', type: 'date', colSpan: 1 },
      { name: 'runTo', label: 'Run To', type: 'date', colSpan: 1 },
    ],
    buttons: {
      gridCols: 6,
      items: [
        {
          label: saving ? 'Saving...' : 'Save & Continue',
          type: 'submit',
          variant: 'orange',
          colSpan: 2,
          size: 'md',
          className: 'mt-4',
          disabled: saving,
        },
      ],
    },
  }



// Update the handleSave function
const handleSave = async (data: Record<string, any>) => {
  try {
    setSaving(true)
    const formattedRunFrom = data.runFrom ? new Date(data.runFrom).toISOString().split('T')[0] : '';
    const formattedRunTo = data.runTo ? new Date(data.runTo).toISOString().split('T')[0] : '';

    const payload: IConfigCommissionRequest = {
      commissionName: data.commissionName,
      triggerCycle: data.triggerCycle,
      runFrom: formattedRunFrom,
      runTo: formattedRunTo,
    }

    const response = await commissionService.configCommission(payload)

    console.log("Full API Response:", response)
    
    if (!response) {
      throw new Error('No response received from API')
    }
    
    // Check for success - errorCode 1101 or 0 (common success codes)
    const isSuccess = response?.responseHeader?.errorCode === 1101 || response?.responseHeader?.errorMessage === "SUCCESS"
    
    if (isSuccess) {
      // Handle both possible response structures (array or single object)
      const responseBody = response.responseBody as any
      const commissionConfigId = 
        responseBody?.commissionConfig?.[0]?.commissionConfigId
      
      // ✅ MOVE TO STEP 2
      if (!commissionConfigId) {
        console.error('Response body:', response.responseBody)
        throw new Error('Commission ID not returned from API')
      }
      // Pass the commissionConfigId to the onSaveSuccess callback
      onSaveSuccess(commissionConfigId);
    } else {
      const errorCode = response?.responseHeader?.errorCode
      const errorMessage = response?.responseHeader?.errorMessage || 'Failed to save commission configuration'
      console.error('API Error Details:', {
        errorCode,
        errorMessage,
        fullResponse: response
      })
      alert(`Error ${errorCode || 'Unknown'}: ${errorMessage}`)
    }
  } catch (error: any) {
    console.error('Error saving commission config:', error)
    const errorMessage = error?.message || error?.response?.data?.message || 'Something went wrong while saving'
    alert(errorMessage)
  } finally {
    setSaving(false)
  }
}


  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  const {
    data: processedRecordsLog,
    isLoading: processcommissionLoading,
    isError: processcommissionQueryError,
    error: processcommissionQueryErrorObj,
  } = useQuery<FirstStepFormCommissionProps>({
    queryKey: ['process-commission'],
    enabled: canFetch,
    queryFn: () => commissionService.processCommission(),
    staleTime: 1000 * 60 * 60, // 1 hour
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  useEffect(() => {
    if (processcommissionQueryError) {
      const msg =
        (processcommissionQueryErrorObj as any)?.message ||
        'Failed to fetch commission processing data'
      setLocalError(msg)
    } else {
      setLocalError(null)
    }
  }, [processcommissionQueryError, processcommissionQueryErrorObj])


  const loading = processcommissionLoading
  if (loading) return <Loader />
  if (localError)
    return <div className="p-4 text-red-600">Error: {localError}</div>

return (
    <div className="bg-white p-6 rounded-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-semibold">
          Step 1: Commission Config Setup
        </h4>
      </div>

      {/* Dynamic Form */}
      <DynamicFormBuilder
        config={{
          ...commissionStepOneFormConfig,
          defaultValues: {
            triggerCycle: 'daily',
          },
        }}
        onSubmit={handleSave}
      />
    </div>
  )

}
export { FirstStepFormCommission }
