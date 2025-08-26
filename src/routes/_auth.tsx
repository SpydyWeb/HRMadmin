import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { auth } from '../auth';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ location }) => {
    console.log('Auth route beforeLoad check',auth.isAuthenticated(),location);
    
    if (!auth.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
  },
  component: AuthLayout,
  
});

function AuthLayout() {
  return (
    <div className="p-1">
      <Outlet />
    </div>
  );
}
