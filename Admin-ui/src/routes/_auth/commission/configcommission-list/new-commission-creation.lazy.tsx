import ConfigCommission from '@/Pages/configCommission'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/commission/configcommission-list/new-commission-creation')({
  component: ConfigCommission,
})
