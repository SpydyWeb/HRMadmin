import { createLazyFileRoute } from '@tanstack/react-router'
import ProgramConfig from '@/Pages/ProgramConfig'

export const Route = createLazyFileRoute('/_auth/search/incentive/program-config/')({
  component: ProgramConfig,
})
