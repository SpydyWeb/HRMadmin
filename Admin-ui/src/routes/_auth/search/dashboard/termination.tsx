import Termination from '@/Pages/Termination'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/search/dashboard/termination')({
  component: Termination,
})
