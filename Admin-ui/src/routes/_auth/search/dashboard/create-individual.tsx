import { createFileRoute } from '@tanstack/react-router'
import CreateIndividual from '@/Pages/CreateIndividual'

export const Route = createFileRoute('/_auth/search/dashboard/create-individual')({
  component: CreateIndividual,
})
