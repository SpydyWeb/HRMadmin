import { createLazyFileRoute } from '@tanstack/react-router'
import KpiBuilderScreen from '@/Pages/KpiBuilderScreen'

export const Route = createLazyFileRoute('/_auth/search/incentive/kpi-builder')({
  component: KpiBuilderScreen,
})

