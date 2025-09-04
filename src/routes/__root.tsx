import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext  
} from '@tanstack/react-router'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { auth } from '@/auth'
import '../styles.css'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import BreadcrumbCustom from '@/components/BreadcrumbCustom'
import ScrollToTop from '@/utils/ScrollToTop'
import { ToastProvider } from '@/components/ui/Toast'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

interface MyRouterContext {
  queryClient: any
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Hierarchy Management System',
      },
    ],
  }),
  beforeLoad: ({ location }) => {
    const isAuthenticated = auth.isAuthenticated()
    const isLoginPage = location.pathname === '/login'
    return {
      isAuthenticated,
      isLoginPage,
    }
  },
  component: RootComponent,
})

function RootComponent() {
  const queryClient = new QueryClient()
  const { isAuthenticated, isLoginPage } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setIsLoading(false)

  }, [ navigate])

  if (isLoading) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <Loader />
          <Scripts />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {!isAuthenticated ? (
            // Show only login page when not authenticated
            <Outlet />
          ) : (
            // Show main application when authenticated
            <Layout>
              <ScrollToTop />
              <BreadcrumbCustom />
              <Outlet />
            </Layout>
          )}
        </QueryClientProvider>
        <ToastProvider  />
         <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
