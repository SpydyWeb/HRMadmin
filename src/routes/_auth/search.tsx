import SearchInterface from '@/Pages/SearchInterface'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/search')({
  component: SearchInterface,
})

