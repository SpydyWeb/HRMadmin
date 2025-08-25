import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import React from 'react'

import Header from '../components/Header'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import StoreDevtools from '../lib/demo-store-devtools'
import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'
import theme from '@/components/theme'
import Sidebar from '@/components/Sidebar'
import { auth } from './_auth' // Updated import path

interface MyRouterContext {
  queryClient: QueryClient
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
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  beforeLoad: ({ location }) => {
    const isAuthenticated = auth.isAuthenticated();
    const isLoginPage = location.pathname === '/login';
    
    // If not authenticated and not on login page, we'll handle redirect in component
    // If authenticated and on login page, we'll handle redirect in component
    
    return {
      isAuthenticated,
      isLoginPage,
    };
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoginPage } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
    
    // Handle redirects based on authentication status
    if (!isAuthenticated && !isLoginPage) {
      // Not authenticated and not on login page - redirect to login
      navigate({ to: '/login', replace: true });
    } else if (isAuthenticated && isLoginPage) {
      // Authenticated but on login page - redirect to dashboard
      navigate({ to: '/dashboard', replace: true });
    }
  }, [isAuthenticated, isLoginPage, navigate]);

  React.useEffect(() => {
    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwt_token') {
        const stillAuthenticated = auth.isAuthenticated();
        if (!stillAuthenticated && !isLoginPage) {
          navigate({ to: '/login', replace: true });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isLoginPage, navigate]);

  if (isLoading) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                backgroundColor: '#f5f5f5'
              }}
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </Box>
          </ThemeProvider>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          
          {!isAuthenticated ? (
            // Show only login page when not authenticated
            <Box component="main">
              {children}
            </Box>
          ) : (
            // Show main application when authenticated
            <Box component="main">
              <Header />
              <Sidebar />
              <div className='mt-[6rem] ml-[19rem]'>
                {children}
              </div>
            </Box>
          )}
          
          {/* Only show devtools when authenticated */}
          {isAuthenticated && (
            <TanstackDevtools
              config={{
                position: 'bottom-left',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
                StoreDevtools,
              ]}
            />
          )}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}