import '../styles.css'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import BreadcrumbCustom from '@/components/BreadcrumbCustom'
import ScrollToTop from '@/utils/ScrollToTop'
import { ToastProvider } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/auth'
import { RoutePaths } from '@/utils/constant'

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
  component: RootComponent,
})

function RootComponent() {
  const queryClient = new QueryClient()
  const { token } = useAuth()
  const navigate = Route.useNavigate()
  const [isLoading, setIsLoading] = React.useState(true)
  const location = useLocation()
  React.useEffect(() => {
    setIsLoading(false)
  }, [navigate])
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
          {token && !(location.pathname === RoutePaths.LOGIN) ? (
            <Layout>
              <ScrollToTop />
              <BreadcrumbCustom />
              <Outlet />
            </Layout>
          ) : (
            <Outlet />
          )}
        </QueryClientProvider>
        <ToastProvider />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
