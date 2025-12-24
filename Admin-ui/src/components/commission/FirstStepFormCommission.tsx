import { ImArrowDown2, ImArrowUp2 } from 'react-icons/im'
import { MiniChart } from '../MiniChart'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { FaPlus } from 'react-icons/fa6'
import { LuSquareUserRound } from 'react-icons/lu'
import { RxDownload, RxUpload } from 'react-icons/rx'
import DataTable from '../table/DataTable'
import { RoutePaths } from '@/utils/constant'
import Button from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { ActionItem } from '@/utils/models'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
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
}

const FirstStepFormCommission: React.FC<FirstStepFormCommissionProps> = () => {
  const [formValues, setFormValues] = useState<IConfigCommissionRequest>({
    id: 0,
    orgId: 0,
    commissionName: '',
    triggerCycle: 'DAILY',
    runFrom: '',
    runTo: '',
    createdAt: new Date().toISOString(),
  })

  const [localError, setLocalError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)

  const handleChange = (key: keyof IConfigCommissionRequest, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }))
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
    { name: 'commissionName', label: 'Commission Name', type: 'text', colSpan: 1 , variant: 'standard'},
    {
      name: 'triggerCycle',
      label: 'Trigger Cycle',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'Daily', value: 'DAILY' },
        { label: 'Weekly', value: 'WEEKLY' },
        { label: 'Monthly', value: 'MONTHLY' },
      ],
    },
    { name: 'runFrom', label: 'Run From', type: 'date', colSpan: 1 },
    { name: 'runTo', label: 'Run To', type: 'date', colSpan: 1 },
    
  ],
   buttons:{
          gridCols: 6,
          items: [
            {
              label: 'Save',
              type: 'submit',
              variant: 'orange',
              colSpan: 2,
              size: 'md',
              className: 'whitespace-nowrap, mt-4',
            },
          ],
        }
}
  const handleSave = async (data: Record<string, any>) => {
    try {
      setSaving(true)

      const orgId = Number(localStorage.getItem('orgId')) || 0

      const payload: IConfigCommissionRequest = {
        id: 0,
        orgId,
        commissionName: data.commissionName,
        triggerCycle: data.triggerCycle,
        runFrom: data.runFrom,
        runTo: data.runTo,
      }

      const response = await commissionService.configCommission(payload)

      if (response?.success) {
        alert('Commission configuration saved successfully')
      } else {
        alert(response?.message || 'Failed to save configuration')
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong while saving')
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
          Step 1: Commission Setup
        </h4>
      </div>

      {/* Dynamic Form */}
      <DynamicFormBuilder
        config={{
          ...commissionStepOneFormConfig,
          defaultValues: {
            triggerCycle: 'DAILY',
          },
        }}
        onSubmit={handleSave}
      />
    </div>
  )

}
export { FirstStepFormCommission }
