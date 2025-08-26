import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'
import React from 'react'
import { auth } from '@/auth'
import "../styles.css"
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import BreadcrumbCustom from '@/components/BreadcrumbCustom'
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

  if (isLoading ) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
         <Loader/>
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
           <Outlet />
         
        ) : (
          // Show main application when authenticated
          <Layout> 
            <BreadcrumbCustom/>           
              <Outlet />          
            </Layout>
        
        )}
        <Scripts />
      </body>
    </html>
  )
}