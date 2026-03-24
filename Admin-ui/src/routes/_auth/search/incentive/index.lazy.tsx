import { createLazyFileRoute } from '@tanstack/react-router'
import IncentiveDashboard from '@/Pages/IncentiveDashboard'

export const Route = createLazyFileRoute('/_auth/search/incentive/')({
  component: IncentiveDashboard,
})
