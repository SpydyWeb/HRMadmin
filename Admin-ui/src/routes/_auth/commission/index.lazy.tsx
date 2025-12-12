
import { createLazyFileRoute } from '@tanstack/react-router'
import Commission from '@/Pages/Commission'

export const Route = createLazyFileRoute('/_auth/commission/')({
  component: Commission,
})
