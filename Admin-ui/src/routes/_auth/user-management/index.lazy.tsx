import { createLazyFileRoute } from '@tanstack/react-router'
import UserManagement from '@/Pages/UserManagement'

export const Route = createLazyFileRoute('/_auth/user-management/')({
  component: UserManagement,
})
