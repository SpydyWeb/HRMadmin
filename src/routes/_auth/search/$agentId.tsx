import ProfileDetails from '@/Pages/ProfileDetails'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/search/$agentId')({
  component: ProfileDetails,
})
