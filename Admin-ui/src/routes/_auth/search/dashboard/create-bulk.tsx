import { createFileRoute } from '@tanstack/react-router'
import CreateBulk from '@/Pages/CreateBulk'

export const Route = createFileRoute('/_auth/search/dashboard/create-bulk')({
  component: CreateBulk,
})
