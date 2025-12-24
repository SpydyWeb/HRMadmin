import ConfigCommission from '@/Pages/configCommission'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/commission/configcomission/')({
  component: ConfigCommission,
})






