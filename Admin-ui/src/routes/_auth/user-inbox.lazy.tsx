import { createLazyFileRoute } from '@tanstack/react-router'
import UserInbox from '@/Pages/UserInbox'

export const Route = createLazyFileRoute('/_auth/user-inbox')({
  component: UserInbox,
})
