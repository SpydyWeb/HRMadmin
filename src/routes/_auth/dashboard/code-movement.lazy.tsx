import { createLazyFileRoute } from '@tanstack/react-router'
import CodeMovement from '@/Pages/CodeMovement'

export const Route = createLazyFileRoute('/_auth/dashboard/code-movement')({
  component: CodeMovement,
})


