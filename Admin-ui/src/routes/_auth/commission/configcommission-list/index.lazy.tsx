import ConfigCommissionList from '@/Pages/ConfigCommissionList'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/commission/configcommission-list/')({
  component: ConfigCommissionList,
})

