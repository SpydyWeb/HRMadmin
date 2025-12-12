import BulkAction from '@/Pages/BulkAction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/commission/code-movement/bulk-action',
)({
  component: BulkAction,
})


