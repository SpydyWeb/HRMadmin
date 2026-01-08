import CommissionHistory from '@/Pages/CommissionHistory'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/commission/configcommission-list/history')({
  component: CommissionHistory,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      commissionName: (search.commissionName as string) || '',
      commissionId: (search.commissionId as string) || '',
    }
  },
})

