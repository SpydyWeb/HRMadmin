import { createFileRoute } from '@tanstack/react-router'
import Termination from '@/Pages/Termination'

export const Route = createFileRoute('/_auth/termination')({
  component: Termination,
})
