import NotFound from '@/Pages/NotFound'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/dashboard/$not-found')({
  component: NotFound,
})

