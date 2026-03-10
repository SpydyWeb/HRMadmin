import { createLazyFileRoute } from '@tanstack/react-router'
import OrgConfiguration from '@/Pages/OrgConfiguration'

export const Route = createLazyFileRoute('/_auth/org-configuration/')({
  component: OrgConfiguration,
})