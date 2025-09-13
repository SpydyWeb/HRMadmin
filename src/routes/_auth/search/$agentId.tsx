import ProfileDetails from '@/Pages/ProfileDetails'
import { agentService } from '@/services/agentService'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/search/$agentId')({
  component: ProfileDetails,
    loader: async ({ params }) => {
    console.log('Loader called with', params.agentId) 
    const res = await agentService.searchbycode({ AgentCode: params.agentId })
    return res.data?.[0] ?? null
  },
})
