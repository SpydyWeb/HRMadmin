import BulkAction from '@/Pages/BulkAction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/commission/processcommission/bulk-action',
)({
  component: BulkAction,
})


