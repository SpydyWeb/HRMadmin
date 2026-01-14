import { useEffect, useState, useRef } from 'react'
import { commissionService } from '@/services/commissionService'
import { IConfigCommissionRequest } from '@/models/commission'
import DynamicFormBuilder from '../form/DynamicFormBuilder'
import { z } from 'zod'
import { showToast } from '@/components/ui/sonner'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import CommissionFormulaEditorFilter from './ComissionConfigFormulaEditorFilter'
import Button from '@/components/ui/button'



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

// Update form values when initialData changes (for edit mode)
// Update form values when initialData changes (for edit mode)
// useEffect(() => {
//   if (initialData && isEditMode) {
//     const updatedFormValues = {
//       commissionName: initialData.commissionName || '',
//       runFrom: initialData.runFrom ? formatDateToLocal(initialData.runFrom) : '',
//       runTo: initialData.runTo ? formatDateToLocal(initialData.runTo) : '',
//       comments: initialData.comments || '',
//       // Fix: Use filterCondition (singular) from API response
//       filterConditions: initialData.filterCondition || initialData.filterConditions || '',
//     }
//     setFormValues(updatedFormValues)
//     // Fix: Use filterCondition (singular) from API response
//     setFilterFormula(initialData.filterCondition || initialData.filterConditions || '')
//   }
// }, [initialData, isEditMode])

// In FirstStepFormCommission, add this debug line
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



// Update the handleSave function
const handleSave = async (data: Record<string, any>) => {
  try {
    setSaving(true)
    
    // Store the latest form data for fallback use
    formDataRef.current = data
   
    // Merge submitted data with existing formValues to preserve unchanged fields
    // This ensures that if a user doesn't change a field, the existing value is still saved
    const mergedData = {
      ...formValues,
      ...data,
    }

    // Helper function to safely convert date to YMD format
    const safeDateToYMD = (dateValue: any): string => {
      if (!dateValue) return ''
      try {
        // If it's already a Date object, use it directly
        if (dateValue instanceof Date) {
          return toYMD(dateValue)
        }
        // If it's a string, convert to Date first
        if (typeof dateValue === 'string' && dateValue.trim()) {
          return toYMD(new Date(dateValue))
        }
        return ''
      } catch (error) {
        console.warn('Error converting date:', dateValue, error)
        return ''
      }
    }

    const payload: IConfigCommissionRequest = {
      commissionName: mergedData.commissionName || formValues.commissionName || '',
      runFrom: safeDateToYMD(mergedData.runFrom || formValues.runFrom),
      runTo: safeDateToYMD(mergedData.runTo || formValues.runTo),
      comments: mergedData.comments !== undefined ? (mergedData.comments || '') : (formValues.comments || ''),
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
        // According to IConfigCommissionResponseBody, the response has commissionId (not commissionConfigId)
        // Try different possible response structures
        returnedCommissionConfigId = 
          responseBody?.commissionConfig?.[0]?.commissionConfigId ||
          responseBody?.commissionConfig?.[0]?.commissionId ||
          (Array.isArray(responseBody?.commissionConfig) && responseBody.commissionConfig.length > 0 
            ? responseBody.commissionConfig[0].commissionId || responseBody.commissionConfig[0].commissionConfigId
            : null) ||
          responseBody?.commissionId ||
          (responseBody as any)?.commissionConfigId
      }
      
      // ✅ MOVE TO STEP 2
      if (!returnedCommissionConfigId) {
        console.error('Response body:', JSON.stringify(response.responseBody, null, 2))
        console.error('Could not find commissionId/commissionConfigId in response. Available keys:', Object.keys(responseBody || {}))
        throw new Error('Commission ID not returned from API. Response structure may have changed.')
      }
      // Update formValues to reflect the saved state (use mergedData to preserve original date format)
      // This ensures formValues always has the latest values for future saves
      const updatedFormValues = {
        commissionConfigId: commissionConfigId || returnedCommissionConfigId,
        commissionName: mergedData.commissionName || formValues.commissionName || '',
        runFrom: mergedData.runFrom || formValues.runFrom || '',
        runTo: mergedData.runTo || formValues.runTo || '',
        comments: mergedData.comments !== undefined ? (mergedData.comments || '') : (formValues.comments || ''),
        filterConditions: payload.filterConditions || formValues.filterConditions || '',
      }
      setFormValues(updatedFormValues)
      
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
            
            // Try to trigger form submission first - this will call handleSave with current form values
            let formSubmitted = false
            
            // Method 1: Click the hidden submit button via ref
            if (hiddenSubmitButtonRef.current) {
              try {
                console.log('Trying to click hidden submit button via ref')
                hiddenSubmitButtonRef.current.click()
                formSubmitted = true
                // If we managed to click a submit button, hand off to the form's onSubmit.
                // Don't rely on reading `saving` here: state updates won't change this closure's `saving` value.
                return
              } catch (e) {
                console.warn('Failed to click stored button ref:', e)
              }
            }
            
            // Method 2: Find and click the hidden submit button
            if (!formSubmitted) {
              const submitBtn = document.querySelector('button[type="submit"].hidden') as HTMLButtonElement
              if (submitBtn) {
                console.log('Found hidden submit button, clicking...')
                hiddenSubmitButtonRef.current = submitBtn
                submitBtn.click()
                formSubmitted = true
                return
              }
            }
            
            // Method 3: Try to find any submit button
            if (!formSubmitted) {
              const allSubmitButtons = document.querySelectorAll('button[type="submit"]')
              for (const btn of allSubmitButtons) {
                const buttonElement = btn as HTMLButtonElement
                if (buttonElement.classList.contains('hidden') || buttonElement.closest('.hidden')) {
                  console.log('Found submit button, clicking...')
                  hiddenSubmitButtonRef.current = buttonElement
                  buttonElement.click()
                  formSubmitted = true
                  return
                }
              }
            }
            
            // Method 4: Use form.requestSubmit (modern browsers)
            if (!formSubmitted) {
              const formElement = document.querySelector('form') as HTMLFormElement
              if (formElement) {
                console.log('Trying form.requestSubmit...')
                if (formElement.requestSubmit) {
                  formElement.requestSubmit()
                  formSubmitted = true
                  return
                } else {
                  // Fallback: create temporary submit button
                  console.log('Creating temporary submit button...')
                  const tempSubmit = document.createElement('button')
                  tempSubmit.type = 'submit'
                  tempSubmit.style.display = 'none'
                  formElement.appendChild(tempSubmit)
                  tempSubmit.click()
                  setTimeout(() => {
                    if (formElement.contains(tempSubmit)) {
                      formElement.removeChild(tempSubmit)
                    }
                  }, 100)
                  formSubmitted = true
                  return
                }
              }
            }
            
            // Fallback: Direct save if form submission didn't work
            // Get current form values and call handleSave directly
            console.warn('Form submit trigger not found; falling back to direct save...')
            console.log('Current formValues:', formValues)
            
            // Get current values from form fields as fallback
            const getFormValue = (name: string): string => {
              const input = document.querySelector(`input[name="${name}"], textarea[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement
              return input?.value || ''
            }
            
            // Try to get date values - DatePicker might store them differently
            const getDateValue = (name: string): string => {
              // Try multiple selectors for date fields
              const dateInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement
              if (dateInput?.value) return dateInput.value
              
              // DatePicker might use a different structure
              const datePicker = document.querySelector(`[data-field="${name}"]`) as HTMLElement
              if (datePicker) {
                const value = datePicker.getAttribute('value') || datePicker.textContent
                if (value) return value
              }
              
              return ''
            }
            
            const currentData: Record<string, any> = {
              commissionName: getFormValue('commissionName') || formValues.commissionName || '',
              runFrom: getDateValue('runFrom') || formValues.runFrom || '',
              runTo: getDateValue('runTo') || formValues.runTo || '',
              comments: getFormValue('comments') || formValues.comments || '',
            }
            
            console.log('Current form data to save:', currentData)
            
            // Validate required fields
            if (!currentData.commissionName || !currentData.runFrom || !currentData.runTo) {
              console.error('Validation failed:', { currentData })
              showToast(NOTIFICATION_CONSTANTS.ERROR, 'Validation Error', {
                description: 'Please fill in all required fields (Commission Name, Run From, Run To)'
              })
              return
            }
            
            // Call handleSave directly
            console.log('Calling handleSave directly with:', currentData)
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
