
import { createLazyFileRoute } from '@tanstack/react-router'
import Dashboard from '@/Pages/Dashboard'

export const Route = createLazyFileRoute('/_auth/dashboard/')({
  component: Dashboard,
})
