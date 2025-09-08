import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { RoutePaths } from '@/utils/constant';
import { auth } from '@/auth';

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    const isAuth = auth.isAuthenticated()
    // if (!isAuth) {
    //   throw redirect({
    //     to: RoutePaths.LOGIN,
    //   })
    // }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return <Outlet />
}
