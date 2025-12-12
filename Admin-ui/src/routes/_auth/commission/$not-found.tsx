import NotFound from '@/Pages/NotFound'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/commission/$not-found')({
  component: NotFound,
})

