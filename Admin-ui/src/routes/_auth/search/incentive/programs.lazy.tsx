import { createLazyFileRoute } from '@tanstack/react-router'
import IncentiveProgramsList from '@/Pages/IncentiveProgramsList'

export const Route = createLazyFileRoute('/_auth/search/incentive/programs')({
  component: IncentiveProgramsList,
})
