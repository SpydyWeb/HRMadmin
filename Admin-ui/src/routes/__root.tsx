import '../styles.css'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,

  useLocation,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import BreadcrumbCustom from '@/components/BreadcrumbCustom'
import ScrollToTop from '@/utils/ScrollToTop'
import { useAuth } from '@/hooks/useAuth'
import { RoutePaths } from '@/utils/constant'
import { ToastProvider } from '@/components/ui/sonner'
import { useEncryptionReady } from '@/hooks/useEncryptionReady'
import { authStore } from '@/store/authStore'

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
  const location = useLocation()
  const encryptionReady = useEncryptionReady() // 👈 use our hook
console.log('Encryption Ready:', authStore.state.token, encryptionReady)
  if (!encryptionReady) {
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
          {token && location.pathname !== RoutePaths.LOGIN ? (
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
