import { createLazyFileRoute } from '@tanstack/react-router'
import RolesManagement from '@/Pages/RolesManagement'

export const Route = createLazyFileRoute('/_auth/roles-management/')({
  component: RolesManagement,
})