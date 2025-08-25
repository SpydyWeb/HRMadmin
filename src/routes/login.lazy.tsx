import { createLazyFileRoute, redirect } from '@tanstack/react-router'
import Login from '@/Pages/Login'
import { auth } from '@/auth'

export const Route = createLazyFileRoute('/login')({
  beforeLoad: () => {
    // If already authenticated, redirect to dashboard
    if (auth.isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  return <Login />
}