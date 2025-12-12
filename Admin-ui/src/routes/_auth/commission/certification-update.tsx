import CertificationUpdate from '@/Pages/CertificationUpdate'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/commission/certification-update')({
  component: CertificationUpdate,
})


