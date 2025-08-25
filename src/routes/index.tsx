import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '@/auth'

export const Route = createFileRoute('/')({
  component: App,
 beforeLoad: () => {
    // Redirect to dashboard if authenticated, otherwise to login
    if (auth.isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
      })
    } else {
      throw redirect({
        to: '/login',
      })
    }
  },
})

function App() {
  return (
    <div className="text-center">
    
    </div>
  )
}
