import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import React from 'react'
import { auth } from '@/auth'
import "../styles.css"
interface MyRouterContext {
  queryClient: any;
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
    const isAuthenticated = auth.isAuthenticated();
    const isLoginPage = location.pathname === '/login';
    
    return {
      isAuthenticated,
      isLoginPage,
    };
  },
  component: RootComponent,
})

function RootComponent() {
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

  if (isLoading) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
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
        {!isAuthenticated ? (
          // Show only login page when not authenticated
          <Box component="main">
            <Outlet />
          </Box>
        ) : (
          // Show main application when authenticated
          <Box component="main">
            {/* Header component would go here */}
            {/* Sidebar component would go here */}
            <div className='mt-[6rem] ml-[19rem]'>
              <Outlet />
            </div>
          </Box>
        )}
        <Scripts />
      </body>
    </html>
  )
}