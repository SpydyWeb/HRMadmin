import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { commissionService } from '@/services/commissionService'
import { RoutePaths } from '@/utils/constant'

interface FourthStepCommissionConfigProps {
  commissionConfigId?: number; 
  onSaveSuccess: () => void;
}

const FourthStepCommissionConfig: React.FC<FourthStepCommissionConfigProps> = ({ 
  commissionConfigId,
  onSaveSuccess
}) => {
  const navigate = useNavigate()
  const [enabled, setEnabled] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      await commissionService.updateStatus({
        commissionConfigId: commissionConfigId,
        enabled,
      })

      onSaveSuccess()
      // Navigate to configcommission-list page after successful save
      navigate({ to: RoutePaths.CONFIG_COMMISSION_LIST })
    } catch (err: any) {
      setError(err?.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-md space-y-4">
      <h2 className="text-lg font-semibold">Commission Status</h2>

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
        className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-gray-400"
      >
        {loading ? 'Saving...' : 'Save Status'}
      </button>
    </div>
  )

};

export { FourthStepCommissionConfig };