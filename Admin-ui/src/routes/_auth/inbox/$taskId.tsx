import TaskApproval from '@/Pages/TaskApproval'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/inbox/$taskId')({
  component: TaskApproval,
})
