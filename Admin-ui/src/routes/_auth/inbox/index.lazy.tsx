import { createLazyFileRoute } from '@tanstack/react-router'
import Inbox from '@/Pages/Inbox'

export const Route = createLazyFileRoute('/_auth/inbox/')({
  component: Inbox,
})
