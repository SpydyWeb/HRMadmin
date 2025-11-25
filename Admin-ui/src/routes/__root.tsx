import { useEffect } from 'react'
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
import { I18nextProvider } from "react-i18next"
import i18n from "@/i18n"
import "../i18n"


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
  const encryptionReady = useEncryptionReady()

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
         <I18nextProvider i18n={i18n}>
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
        </I18nextProvider>
        <ToastProvider />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
