import { createLazyFileRoute, redirect } from '@tanstack/react-router'
import Login from '@/Pages/Login'

export const Route = createLazyFileRoute('/login')({
  component: LoginComponent,
})


function LoginComponent() {
  return <Login />
}