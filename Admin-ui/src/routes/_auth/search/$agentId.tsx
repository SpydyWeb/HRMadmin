import ProfileDetails from '@/Pages/ProfileDetails'
import { agentService } from '@/services/agentService'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/search/$agentId')({
  loader: async ({ params }) => {
    const res = await agentService.searchbycode({
      searchCondition: '',
      zone: '',
      agentId: 0,
      agentCode: params.agentId,
      pageNo: 1,
      pageSize: 10,
      sortColumn: '',
      sortDirection: 'asc',
    })

    if (!res) {
      throw new Error('No data found')
    }

    return res
  },
  component: ProfileDetails,
})

