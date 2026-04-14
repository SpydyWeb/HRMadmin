import { createLazyFileRoute } from '@tanstack/react-router'
import IncentiveKpiList from '@/Pages/IncentiveKpiList'

export const Route = createLazyFileRoute('/_auth/search/incentive/kpis')({
  component: IncentiveKpiList,
})
