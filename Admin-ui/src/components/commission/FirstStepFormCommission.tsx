import { useEffect, useState, useRef } from 'react'
import { commissionService } from '@/services/commissionService'
import { IConfigCommissionRequest } from '@/models/commission'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import { z } from 'zod'
import { showToast } from '@/components/ui/sonner'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import CommissionFormulaEditorFilter from './ComissionConfigFormulaEditorFilter'
import Button from '@/components/ui/button'
import Loader from '@/components/Loader'



interface FirstStepFormCommissionProps {
  responseBody?: {
    processedRecordsLog: any[]
  } 
  commissionConfigId?: number | null
  initialData?: any
  isEditMode?: boolean
  isLoading?: boolean
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
  isLoading = false,
  onSaveSuccess
}) => {
  const [formValues, setFormValues] = useState<IConfigCommissionRequest>({
    commissionName: initialData?.commissionName || '',
    runFrom: initialData?.runFrom ? formatDateToLocal(initialData.runFrom) : '',
    runTo: initialData?.runTo ? formatDateToLocal(initialData.runTo) : '',
    comments: initialData?.comments || '',
    filterConditions: initialData?.filterConditions || '',
    targetType: initialData?.targetType || '',
    targetMethod: initialData?.targetMethod || '',
  })
  const [saving, setSaving] = useState(false)
  const [filterFormula, setFilterFormula] = useState<string>(initialData?.filterConditions || '')
  const hiddenSubmitButtonRef = useRef<HTMLButtonElement | null>(null)
  const formDataRef = useRef<Record<string, any> | null>(null)
  // Keep an up-to-date reference to `saving` for async handlers (avoids stale-closure reads)
  const savingRef = useRef<boolean>(false)

  useEffect(() => {
    savingRef.current = saving
  }, [saving])

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
      comments: z.string().optional(),
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
        name: 'targetType',
        label: 'Target Type',
        type: 'text',
        colSpan: 3,
        variant: 'standard',
      },    {
        name: 'targetMethod',
        label: 'Target Method',
        type: 'text',
        colSpan: 3,
        variant: 'standard',
      },
      {
        name: 'comments',
        label: 'Comments',
        type: 'textarea',
        colSpan: 9,
        variant: 'standard',
      },
    ],
    // Hidden button to trigger form submission with validation
    buttons: {
      gridCols: 6,
      items: [
        {
          label: 'Save & Continue',
          type: 'submit',
          variant: 'orange',
          colSpan: 2,
          size: 'md',
          className: 'hidden',
          disabled: saving,
        },
      ],
    },
  }

useEffect(() => {
  if (initialData && isEditMode) {
    console.log("Initial data received:", initialData);
    console.log("Filter condition value:", initialData.filterCondition);
    
    const updatedFormValues = {
      commissionName: initialData.commissionName || '',
      runFrom: initialData.runFrom ? formatDateToLocal(initialData.runFrom) : '',
      runTo: initialData.runTo ? formatDateToLocal(initialData.runTo) : '',
      comments: initialData.comments || '',
      filterConditions: initialData.filterCondition || initialData.filterConditions || '',
      targetType: initialData.targetType || '',
      targetMethod: initialData.targetMethod || '',
    }
    console.log("Updated form values:", updatedFormValues);
    
    setFormValues(updatedFormValues)
    setFilterFormula(initialData.filterCondition || initialData.filterConditions || '')
    console.log("Filter formula set to:", initialData.filterCondition || initialData.filterConditions || '')
  }
}, [initialData, isEditMode])

// Find and store reference to hidden submit button
// Re-run when form key changes (edit mode re-renders)
useEffect(() => {
  const findSubmitButton = () => {
    // Try multiple selectors to find the hidden submit button
    // First, try to find button with hidden class
    let submitBtn = document.querySelector('button[type="submit"].hidden') as HTMLButtonElement
    
    // If not found, try finding any submit button within a hidden container
    if (!submitBtn) {
      const buttons = document.querySelectorAll('button[type="submit"]')
      buttons.forEach((btn) => {
        const buttonElement = btn as HTMLButtonElement
        if (buttonElement.classList.contains('hidden') || buttonElement.closest('.hidden')) {
          submitBtn = buttonElement
        }
      })
    }
    
    // If still not found, try finding by aria-label or text content
    if (!submitBtn) {
      const allButtons = document.querySelectorAll('button[type="submit"]')
      allButtons.forEach((btn) => {
        const buttonElement = btn as HTMLButtonElement
        const text = buttonElement.textContent?.trim()
        if (text === 'Save & Continue') {
          submitBtn = buttonElement
        }
      })
    }
    
    if (submitBtn) {
      hiddenSubmitButtonRef.current = submitBtn
    }
  }
  
  // Small delay to ensure DynamicFormBuilder has rendered
  // Increase delay slightly for edit mode to account for re-rendering
  const delay = isEditMode ? 200 : 100
  const timer = setTimeout(findSubmitButton, delay)
  
  // Also try again after a longer delay as fallback
  const fallbackTimer = setTimeout(findSubmitButton, 500)
  
  return () => {
    clearTimeout(timer)
    clearTimeout(fallbackTimer)
  }
}, [isEditMode, commissionConfigId]) // Re-run when edit mode or ID changes

  // Show loader when in edit mode and data is loading or not yet available
  // This check must be AFTER all hooks are called to avoid "Rendered more hooks" error
  const isDataLoading = isLoading || (isEditMode && !initialData)
  
  if (isDataLoading) {
    return <Loader />
  }

// Helper function to convert date to YYYY-MM-DD format
const formatDateToYYYYMMDD = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return '';
  
  let date: Date;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    date = dateValue;
  } 
  // If it's a string, try to parse it
  else if (typeof dateValue === 'string') {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    // Try parsing the date string (handles formats like "15 Jan 2025" from DatePicker)
    date = new Date(dateValue);
    // If parsing failed, return empty string
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateValue);
      return '';
    }
  } else {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Update the handleSave function
const handleSave = async (data: Record<string, any>) => {
  try {
    setSaving(true)

    // 1️⃣ Merge existing + updated values
    const mergedData = {
      ...formValues,   // existing DB values
      ...data,         // edited values
    }

 

    // 2️⃣ Format dates to YYYY-MM-DD format
    const formattedRunFrom = formatDateToYYYYMMDD(mergedData.runFrom);
    const formattedRunTo = formatDateToYYYYMMDD(mergedData.runTo);

    console.log('Formatted dates:', {
      runFrom: formattedRunFrom,
      runTo: formattedRunTo,
    });

    // 3️⃣ Build payload
    const payload: IConfigCommissionRequest = {
      commissionName: mergedData.commissionName,
      runFrom: formattedRunFrom,
      runTo: formattedRunTo,
      comments: mergedData.comments ?? '',
      filterConditions: filterFormula?.trim() || '',
      targetType: mergedData.targetType,
      targetMethod: mergedData.targetMethod,
      commissionConfigId: 0,
    }

    // 4️⃣ VERY IMPORTANT: add ID in edit
    if (isEditMode) {
      if (!commissionConfigId) {
        throw new Error('commissionConfigId missing in edit mode')
      }
      payload.commissionConfigId = commissionConfigId
    }


    // 5️⃣ Call SAME API (backend handles create/update)
    const response = await commissionService.configCommission(payload)
    console.log("create response", response)

    const isSuccess =
      response?.responseHeader?.errorCode === 1101 ||
      response?.responseHeader?.errorMessage === 'SUCCESS'

    if (!isSuccess) {
      throw new Error(response?.responseHeader?.errorMessage || 'Save failed')
    }

    // 6️⃣ Persist updated state
    setFormValues(payload)

    showToast(
      NOTIFICATION_CONSTANTS.SUCCESS,
      isEditMode ? 'Commission updated successfully' : 'Commission created successfully'
    )

    onSaveSuccess(commissionConfigId ?? response?.responseBody?.commissionConfigId)

  } catch (err: any) {
    console.error(err)
    showToast(NOTIFICATION_CONSTANTS.ERROR, 'Save failed', {
      description: err.message || 'Something went wrong',
    })
  } finally {
    setSaving(false)
  }
}

  // Reference format for useQuery API calls:
  // const {
  //   data,
  //   isLoading,
  //   isError,
  //   error,
  // } = useQuery({
  //   queryKey: ['unique-key'],
  //   enabled: canFetch, // optional: encryption check
  //   queryFn: () => commissionService.someMethod(params),
  //   staleTime: 1000 * 60 * 60, // 1 hour
  //   refetchOnWindowFocus: false,
  //   retry: 1,
  // })

return (
    <div className="bg-white p-6 rounded-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-semibold">
          Step 1: Commission Config Setup
        </h4>
      </div>

      {/* Dynamic Form - First */}
      <DynamicFormBuilder
        key={isEditMode && initialData ? `edit-${commissionConfigId}` : 'new'}
        config={{
          ...commissionStepOneFormConfig,
          defaultValues: formValues,
        }}
        onSubmit={handleSave}
      />

      <CommissionFormulaEditorFilter
  key={isEditMode && initialData ? `filter-edit-${commissionConfigId}` : 'filter-new'}
  onFormulaChange={(formula) => setFilterFormula(formula)}
  // Use only initialData for initialFormula, not filterFormula state to prevent toggling loop
  initialFormula={initialData?.filterCondition || initialData?.filterConditions || ''}
/>

      {/* Save Button - At the end */}
      <div className="flex justify-start mt-4">
        <Button
          type="button"
          variant="orange"
          size="md"
          onClick={async () => {
            if (savingRef.current) {
              console.log('Save already in progress, ignoring click')
              return
            }
            
            console.log('Save button clicked, attempting to save...')
            
            // Try to trigger form submission first (preferred method for validation)
            // Try clicking the hidden submit button
            const submitBtn = hiddenSubmitButtonRef.current || 
                            (document.querySelector('button[type="submit"].hidden') as HTMLButtonElement)
            
            if (submitBtn) {
              try {
                console.log('Attempting to trigger form submission via hidden submit button...')
                if (!hiddenSubmitButtonRef.current) {
                  hiddenSubmitButtonRef.current = submitBtn
                }
                // Trigger click event
                submitBtn.click()
                // Wait a bit to see if form submission was triggered
                await new Promise(resolve => setTimeout(resolve, 200))
                // If saving state changed, form submission worked
                if (savingRef.current) {
                  console.log('Form submission successful')
                  return
                }
              } catch (e) {
                console.warn('Failed to trigger form submission:', e)
              }
            }
            
            // Fallback: Direct save - read current form values from DOM and call handleSave
            console.log('Form submission not triggered; reading form values directly...')
            
            // Helper to get form field values
            const getFormValue = (name: string): string => {
              // Try by id first (most reliable)
              const byId = document.getElementById(name) as HTMLInputElement | HTMLTextAreaElement
              if (byId?.value) return byId.value
              
              // Try by name attribute
              const byName = document.querySelector(`input[name="${name}"], textarea[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement
              if (byName?.value) return byName.value
              
              return ''
            }
            
            // Get date values - DatePicker component structure
            const getDateValue = (name: string): string => {
              // Try standard input first
              const input = document.getElementById(name) as HTMLInputElement
              if (input?.value) return input.value
              
              // DatePicker might render the value in a button or span
              // Look for the DatePicker container and try to find the displayed value
              const container = document.querySelector(`[id*="${name}"], [data-field="${name}"]`) as HTMLElement
              if (container) {
                // Check for any input inside
                const inputInside = container.querySelector('input') as HTMLInputElement
                if (inputInside?.value) return inputInside.value
              }
              
              return ''
            }
            
            // Collect current form data
            const currentData: Record<string, any> = {
              commissionName: getFormValue('commissionName') || formValues.commissionName || '',
              runFrom: getDateValue('runFrom') || formValues.runFrom || '',
              runTo: getDateValue('runTo') || formValues.runTo || '',
              comments: getFormValue('comments') || formValues.comments || '',
            }
            
            console.log('Form data collected:', currentData)
            console.log('Form values state:', formValues)
            
            // Validate required fields
            if (!currentData.commissionName || !currentData.runFrom || !currentData.runTo) {
              console.error('Validation failed:', { currentData })
              showToast(NOTIFICATION_CONSTANTS.ERROR, 'Validation Error', {
                description: 'Please fill in all required fields (Commission Name, Run From, Run To)'
              })
              return
            }
            
            // Call handleSave directly with current form data
            console.log('Calling handleSave with:', currentData)
            await handleSave(currentData)
          }}
          disabled={saving}
          isLoading={saving}
          loadingText="Saving..."
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>

    </div>
  )

}
export { FirstStepFormCommission }
