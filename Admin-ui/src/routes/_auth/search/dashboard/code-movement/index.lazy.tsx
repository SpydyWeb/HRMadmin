import { createLazyFileRoute } from '@tanstack/react-router'
import CodeMovement from '@/Pages/CodeMovement'

export const Route = createLazyFileRoute('/_auth/search/dashboard/code-movement/')({
  component: CodeMovement,
})
