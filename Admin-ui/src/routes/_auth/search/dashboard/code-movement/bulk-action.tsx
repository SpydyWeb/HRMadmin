import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/search/dashboard/code-movement/bulk-action',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/search/dashboard/code-movement/bulk-action"!</div>
}
