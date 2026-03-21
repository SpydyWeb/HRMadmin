import { AlertCard } from '@/components/AlertCard'
import QuickAction from '@/components/QuickAction'
import PendingActionsTable from '@/components/PendingActionsTable'
import ResourcesCard from '@/components/ResourcesCard'
import GoToCard from '@/components/GoToCard'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { commissionService } from '@/services/commissionService'
import { CommissionOverview } from '@/components/commission/CommissionOverview'
import { CommissionCard } from '@/components/commission/CommissionCard'
import Loader from '@/components/Loader'

type CommissionResponse = {
  responseBody?: {
    commissionMgmtDashboards: any[]
  }
}

const Commission: React.FC = () => {
  const [localError, setLocalError] = useState<string | null>(null)
  const navigate = useNavigate()
  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  const {
    data: commissionMgmtDashboards,
    isLoading: commissionLoading,
    isError: commissionQueryError,
    error: commissionQueryErrorObj,
  } = useQuery<CommissionResponse>({
    queryKey: ['commission-dashboard'],
    enabled: canFetch,
    queryFn: () => commissionService.commissionDashboard(),
    staleTime: 1000 * 60 * 60, // 1 hour
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  useEffect(() => {
    if (commissionQueryError) {
      const msg =
        (commissionQueryErrorObj as any)?.message ||
        'Failed to fetch commission dashboard'
      setLocalError(msg)
    } else {
      setLocalError(null)
    }
  }, [commissionQueryError, commissionQueryErrorObj])

const dashboardData = commissionMgmtDashboards?.responseBody?.commissionMgmtDashboards?.[0]
console.log('Dashboard Data:', dashboardData)


  const loading = commissionLoading
  if (loading) return <Loader />
  if (localError)
    return <div className="p-4 text-red-600">Error: {localError}</div>

  return (
    <div className="flex gap-6">
      <div className="w-full space-y-3">
        <CommissionOverview dashboardData={dashboardData} />
        <CommissionCard dashboardData={dashboardData} />
      </div>
    </div>
  )
}

export default Commission
