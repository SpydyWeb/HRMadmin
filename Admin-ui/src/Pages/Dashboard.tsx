import { MetricsCard } from '@/components/MetricsCard'
import { AlertCard } from '@/components/AlertCard'
import QuickAction from '@/components/QuickAction'
import PendingActionsTable from '@/components/PendingActionsTable'
import CompanyOverview from '@/components/CompanyOverview'
import ResourcesCard from '@/components/ResourcesCard'
import GoToCard from '@/components/GoToCard'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useEncryption } from '@/store/encryptionStore'
import encryptionService from '@/services/encryptionService'
import { HMSService } from '@/services/hmsService'
import Loader from '@/components/Loader'
import type { ApiResponse } from '@/models/api'


const Dashboard = () => {
  const [localError, setLocalError] = useState<string | null>(null)
  const encryptionEnabled = useEncryption()
  const keyReady = !!encryptionService.getHrm_Key()
  const canFetch = !encryptionEnabled || keyReady

  const {
    data: hmsDashboardData,
    isLoading: hmsLoading,
    isError: hmsQueryError,
    error: hmsQueryErrorObj,
  } = useQuery<ApiResponse<any>>({
    queryKey: ['hms-dashboard'],
    enabled: canFetch,
    queryFn: () => HMSService.hmsDashboard({} as any),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  })

  useEffect(() => {
    if (hmsQueryError) {
      const msg =
        (hmsQueryErrorObj as any)?.message ||
        'Failed to fetch HMS dashboard'
      setLocalError(msg)
    } else {
      setLocalError(null)
    }
  }, [hmsQueryError, hmsQueryErrorObj])

  // Support both old & new API shapes:
  // New (your example):
  //   ApiResponse<{ hmsDashboard: {...} }>
  // Old:
  //   ApiResponse<{ responseBody: { hmsDashboard: [...] } }>
  const dashboardData = (() => {
    if (!hmsDashboardData) return undefined

    const raw: any = hmsDashboardData.responseBody
    const hms = raw?.hmsDashboard ?? raw?.responseBody?.hmsDashboard

    if (!hms) return undefined

    return Array.isArray(hms) ? hms[0] : hms
  })()

  // Map API response to metrics format
 

  const loading = hmsLoading
  if (loading) return <Loader />
  if (localError)
    return <div className="p-4 text-red-600">Error: {localError}</div>

  // Map API response to metrics format with proper null checks
  const metrics = [
        {
          title: 'Total Entities',
          value: dashboardData?.totalEntitiesCount,
          change: dashboardData?.totalEntitiesThisMonth
            ? `+${dashboardData?.totalEntitiesThisMonth}`
            : '+0',
          changeType: 'positive' as const,
          chartColor: '#10b981',
          chartData: [15, 18, 16, 22, 25, 28, 32, 35, 40],
        },
        {
          title: 'Created This Month',
          value: dashboardData?.entitiesCreatedThisMonth,
          change:
            dashboardData?.entitiesCreatedThisMonth -
              dashboardData?.entitiesCreatedPrevMonth >=
            0
              ? `+${dashboardData.entitiesCreatedThisMonth - dashboardData.entitiesCreatedPrevMonth}`
                  : `${dashboardData?.entitiesCreatedThisMonth - dashboardData?.entitiesCreatedPrevMonth}`,
          changeType:
            dashboardData?.entitiesCreatedThisMonth -
              dashboardData?.entitiesCreatedPrevMonth >=
            0
              ? ('positive' as const)
              : ('negative' as const),
          chartColor:
            dashboardData?.entitiesCreatedThisMonth -
              dashboardData?.entitiesCreatedPrevMonth >=
            0
              ? '#10b981'
              : '#ef4444',
          chartData: [35, 38, 42, 40, 38, 35, 32, 28, 25],
        },
        {
          title: 'Terminated This Month',
          value: dashboardData?.entitiesTerminatedThisMonth,
          change:
            dashboardData?.entitiesTerminatedThisMonth -
              dashboardData?.entitiesTerminatedPrevMonth >=
            0
              ? `+${dashboardData?.entitiesTerminatedThisMonth - dashboardData?.entitiesTerminatedPrevMonth}`
              : `${dashboardData?.entitiesTerminatedThisMonth - dashboardData?.entitiesTerminatedPrevMonth}`,
          changeType:
            dashboardData?.entitiesTerminatedThisMonth -
              dashboardData?.entitiesTerminatedPrevMonth >=
            0
              ? ('positive' as const)
              : ('negative' as const),
          chartColor:
            dashboardData?.entitiesTerminatedThisMonth -
              dashboardData?.entitiesTerminatedPrevMonth >=
            0
              ? '#10b981'
              : '#ef4444',
          chartData: [20, 18, 19, 21, 20, 22, 23, 24, 25],
        },
        {
          title: 'Net Entity This Month',
          value: dashboardData?.entitiesNetThisMonth,
          change: dashboardData?.entitiesNetThisMonth >= 0 
            ? `+${dashboardData?.entitiesNetThisMonth}` 
            : `${dashboardData?.entitiesNetThisMonth}`,
          changeType: dashboardData?.entitiesNetThisMonth >= 0 
            ? ('positive' as const) 
            : ('negative' as const),
          chartColor: dashboardData?.entitiesNetThisMonth >= 0 
            ? '#10b981' 
            : '#ef4444',
          chartData: [20, 18, 19, 21, 20, 22, 23, 24, 25],
        },
      ]
    
  return (
    <div className="flex gap-6">
      
      <div className="w-full space-y-3">
          <MetricsCard metrics={metrics} />
          <AlertCard dashboardData={dashboardData} />
          <PendingActionsTable />
          <CompanyOverview />
      </div>
      <div className="max-w-[18rem] w-full space-y-3">
        <QuickAction />
        <ResourcesCard />
        <GoToCard />
      </div>
    </div>
  )
}

export default Dashboard
