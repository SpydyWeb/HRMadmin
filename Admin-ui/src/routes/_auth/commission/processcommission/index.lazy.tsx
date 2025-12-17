import { createLazyFileRoute } from '@tanstack/react-router'
import ProcessCommission from '@/Pages/ProcessCommission'

export const Route = createLazyFileRoute('/_auth/commission/processcommission/')({
  component: ProcessCommission,
})


