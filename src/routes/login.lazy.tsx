import { createLazyFileRoute, redirect } from '@tanstack/react-router'
import Login from '@/Pages/Login'
import { auth } from '@/auth'

export const Route = createLazyFileRoute('/login')({
  component: LoginComponent,
})


function LoginComponent() {
  return <Login />
}