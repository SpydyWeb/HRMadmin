import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { auth } from '../auth';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ location }) => {
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
    <div className="p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Secure Area</h1>
        <button
          onClick={() => {
            auth.logout();
            window.location.href = '/login';
          }}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </header>
      <Outlet />
    </div>
  );
}
