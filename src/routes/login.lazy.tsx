import { createLazyFileRoute } from '@tanstack/react-router'
import Login from '@/Pages/Login'

export const Route = createLazyFileRoute('/login')({
  component: Login,
})
