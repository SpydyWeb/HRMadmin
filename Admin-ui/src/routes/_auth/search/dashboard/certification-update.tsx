import CertificationUpdate from '@/Pages/CertificationUpdate'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/search/dashboard/certification-update')({
  component: CertificationUpdate,
})
