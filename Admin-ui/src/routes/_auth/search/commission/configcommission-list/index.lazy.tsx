import ConfigCommissionList from '@/Pages/ConfigCommissionList'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/search/commission/configcommission-list/')({
  component: ConfigCommissionList,
})
