import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { commissionService } from '@/services/commissionService'
import { RoutePaths } from '@/utils/constant'
import { showToast } from '@/components/ui/sonner'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'

interface FourthStepCommissionConfigProps {
  commissionConfigId?: number; 
  onSaveSuccess: () => void;
}

const FourthStepCommissionConfig: React.FC<FourthStepCommissionConfigProps> = ({ 
  commissionConfigId,
  onSaveSuccess
}) => {
  const navigate = useNavigate()
  const [enabled, setEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!commissionConfigId) {
      setError('Commission Config ID is required')
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Validation error', {
        description: 'Commission Config ID is required'
      });
      return
    }

    setLoading(true)
    setError('')

    try {
      await commissionService.updateStatus({
        commissionConfigId: commissionConfigId,
        enabled,
      })

      showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Step 4 saved successfully!', {
        description: `Commission status has been set to ${enabled ? 'Active' : 'Inactive'}.`
      });
      onSaveSuccess()
      // Navigate to configcommission-list page after successful save
      navigate({ to: RoutePaths.CONFIG_COMMISSION_LIST })
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update status';
      setError(errorMessage);
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Failed to save status', {
        description: errorMessage
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-md space-y-4">
      <h1 className="text-lg font-semibold">Step 4: Commission Status</h1>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Status Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={enabled === true}
            onChange={() => setEnabled(true)}
          />
          <span className="font-medium">Active</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={enabled === false}
            onChange={() => setEnabled(false)}
          />
          <span className="font-medium">Inactive</span>
        </label>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-50px bg-blue-600 text-white p-2 rounded-md disabled:bg-gray-400"
      >
        {loading ? 'Saving...' : 'Save Status'}
      </button>
    </div>
  )

};

export { FourthStepCommissionConfig };