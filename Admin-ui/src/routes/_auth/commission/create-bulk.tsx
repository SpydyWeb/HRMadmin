import { createFileRoute } from '@tanstack/react-router'
import CreateBulk from '@/Pages/CreateBulk'

export const Route = createFileRoute('/_auth/commission/create-bulk')({
  component: CreateBulk,
})


