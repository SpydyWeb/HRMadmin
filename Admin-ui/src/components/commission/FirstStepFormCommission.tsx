import { useEffect, useState } from 'react'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { useQuery } from '@tanstack/react-query'
import { commissionService } from '@/services/commissionService'
import Loader from '../Loader'
import { IConfigCommissionRequest } from '@/models/commission'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import { z } from 'zod'
import { showToast } from '@/components/ui/sonner'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import CommissionFormulaEditorFilter from './ComissionConfigFormulaEditorFilter'



interface FirstStepFormCommissionProps {
  responseBody?: {
    processedRecordsLog: any[]
  }
  commissionConfigId?: number | null
  initialData?: any
  isEditMode?: boolean
  onSaveSuccess: (id: number) => void
}

// Helper function to format date in local timezone (YYYY-MM-DD)
const formatDateToLocal = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FirstStepFormCommission: React.FC<FirstStepFormCommissionProps> = ({ 
  commissionConfigId,
  initialData,
  isEditMode = false,
  onSaveSuccess
}) => {
  const [formValues, setFormValues] = useState<IConfigCommissionRequest>({
    commissionName: initialData?.commissionName || '',
    runFrom: initialData?.runFrom ? formatDateToLocal(initialData.runFrom) : '',
    runTo: initialData?.runTo ? formatDateToLocal(initialData.runTo) : '',
    comments: initialData?.comments || '',
    filterConditions: initialData?.filterConditions || '',
  })
  const [localError, setLocalError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterFormula, setFilterFormula] = useState<string>(initialData?.filterConditions || '')

  const handleChange = (key: keyof IConfigCommissionRequest, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  //  const formatDateToISO = (dateString: string) => {
  //   if (!dateString) return '';
  //   const date = new Date(dateString);
  //   return date.toISOString();
  // }
  const toYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  


 const commissionStepOneFormConfig = {
    gridCols: 9,
    schema: z.object({
      commissionName: z.string().min(1),
      runFrom: z.string(),
      runTo: z.string(),
    }),
    fields: [
      {
        name: 'commissionName',
        label: 'Commission Name',
        type: 'text',
        colSpan: 3,
        variant: 'standard',
      },
      { name: 'runFrom', label: 'Run From', type: 'date', colSpan: 3 },
      { name: 'runTo', label: 'Run To', type: 'date', colSpan: 3 },
      {
        name: 'comments',
        label: 'Comments',
        type: 'textarea',
        colSpan: 12,
        variant: 'standard',
      },
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

// Update form values when initialData changes (for edit mode)
useEffect(() => {
  if (initialData && isEditMode) {
    setFormValues({
      commissionName: initialData.commissionName || '',
      runFrom: initialData.runFrom ? formatDateToLocal(initialData.runFrom) : '',
      runTo: initialData.runTo ? formatDateToLocal(initialData.runTo) : '',
      comments: initialData.comments || '',
      filterConditions: initialData.filterConditions || '',
    })
    setFilterFormula(initialData.filterConditions || '')
  }
}, [initialData, isEditMode])


// Update the handleSave function
const handleSave = async (data: Record<string, any>) => {
  try {
    setSaving(true)
    // console.log("runFrom",data.runFrom)
   

    const payload: IConfigCommissionRequest = {
      commissionName: data.commissionName,
      runFrom: toYMD(new Date(data.runFrom)),
      runTo: toYMD(new Date(data.runTo)),
      comments: data.comments,
    }
    
    // Only include filterConditions if it has a value
    if (filterFormula && filterFormula.trim()) {
      payload.filterConditions = filterFormula.trim()
    }
    
    // Add commissionConfigId if in edit mode
    if (isEditMode && commissionConfigId) {
      (payload as any).commissionConfigId = commissionConfigId
    }
    
    console.log("payload",payload)

    // Use editCommissionConfig API if in edit mode, otherwise use configCommission
    const response = isEditMode && commissionConfigId
      ? await commissionService.editCommissionConfig(payload)
      : await commissionService.configCommission(payload)

    console.log("Full API Response:", response)
    console.log("Response Type:", typeof response)
    console.log("Response Keys:", response ? Object.keys(response) : 'N/A')
    console.log("Response Header:", response?.responseHeader)
    console.log("Response Body:", response?.responseBody)
    
    // Validate response structure
    if (!response || typeof response !== 'object' || Object.keys(response).length === 0) {
      throw new Error('Invalid or empty response received from API. The API may have failed or returned an unexpected format.')
    }
    
    if (!response.responseHeader) {
      console.error('Response structure:', JSON.stringify(response, null, 2))
      throw new Error('Invalid response structure: missing responseHeader. The API response format may have changed.')
    }
    
    // Check for success - errorCode 1101 or 0 (common success codes)
    const errorCode = response?.responseHeader?.errorCode
    const errorMessage = response?.responseHeader?.errorMessage
    const isSuccess = errorCode === 1101 || errorCode === 0 || errorMessage === "SUCCESS"
    
    console.log("Success Check:", { errorCode, errorMessage, isSuccess })
    
    if (isSuccess) {
      // Handle both possible response structures (array or single object)
      const responseBody = response.responseBody as any
      let returnedCommissionConfigId: number
      
      if (isEditMode && commissionConfigId) {
        // In edit mode, use the existing commissionConfigId
        returnedCommissionConfigId = commissionConfigId
      } else {
        // In create mode, get the ID from the response
        // Try different possible response structures
        returnedCommissionConfigId = 
          responseBody?.commissionConfig?.[0]?.commissionConfigId ||
          responseBody?.commissionConfig?.[0]?.commissionId ||
          responseBody?.commissionId ||
          (responseBody as any)?.commissionConfigId
      }
      
      // ✅ MOVE TO STEP 2
      if (!returnedCommissionConfigId) {
        console.error('Response body:', response.responseBody)
        console.error('Could not find commissionConfigId in response. Available keys:', Object.keys(responseBody || {}))
        throw new Error('Commission ID not returned from API')
      }
      // Show success toast
      const successMessage = isEditMode 
        ? 'Step 1 updated successfully!' 
        : 'Step 1 saved successfully!'
      showToast(NOTIFICATION_CONSTANTS.SUCCESS, successMessage, {
        description: isEditMode 
          ? 'Commission configuration has been updated.' 
          : 'Commission configuration has been saved.'
      })
      // Pass the commissionConfigId to the onSaveSuccess callback
      onSaveSuccess(returnedCommissionConfigId);
    } else {
      const errorCode = response?.responseHeader?.errorCode
      const errorMessage = response?.responseHeader?.errorMessage || 'Failed to save commission configuration'
      console.error('API Error Details:', {
        errorCode,
        errorMessage,
        fullResponse: response
      })
      showToast(NOTIFICATION_CONSTANTS.ERROR, `Error ${errorCode || 'Unknown'}`, {
        description: errorMessage
      })
    }
  } catch (error: any) {
    console.error('Error saving commission config:', error)
    const errorMessage = error?.message || error?.response?.data?.message || 'Something went wrong while saving'
    showToast(NOTIFICATION_CONSTANTS.ERROR, 'Failed to save', {
      description: errorMessage
    })
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
  } = useQuery({
    queryKey: ['process-commission'],
    enabled: canFetch,
    queryFn: () => commissionService.processCommission({} as any),
    staleTime: 1000 * 60 * 60, // 1 hour
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
      <CommissionFormulaEditorFilter
        commissionConfigId={commissionConfigId || undefined}
        onFormulaChange={(formula) => setFilterFormula(formula)}
        initialFormula={filterFormula || initialData?.filterConditions || ''}
      />

      {/* Dynamic Form */}
      <DynamicFormBuilder
        config={{
          ...commissionStepOneFormConfig,
          defaultValues: formValues,
        }}
        onSubmit={handleSave}
      />

   

    </div>
  )

}
export { FirstStepFormCommission }
