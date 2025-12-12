import { createLazyFileRoute } from '@tanstack/react-router'
import CodeMovement from '@/Pages/CodeMovement'

export const Route = createLazyFileRoute('/_auth/commission/code-movement/')({
  component: CodeMovement,
})


