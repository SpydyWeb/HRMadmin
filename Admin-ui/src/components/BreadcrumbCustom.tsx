import React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { RoutePaths } from '@/utils/constant'

function formatLabel(segment: string) {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function BreadcrumbCustom() {
  const { location } = useRouterState()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  // Hide breadcrumb if only dashboard
  if (pathSegments.length === 1) {
    return null
  }

  const crumbs = pathSegments.map((segment, index) => {
    const to = '/' + pathSegments.slice(0, index + 1).join('/')
    const isLast = index === pathSegments.length - 1
    const label = formatLabel(segment)

    return (
      <BreadcrumbItem key={to}>
        {isLast ? (
          <BreadcrumbPage className="font-semibold text-gray-900">{label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link to={to} className="text-gray-400 hover:text-gray-600">{label}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    )
  })

  return (
    <Breadcrumb className='ml-8'>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {crumb}
            {index < crumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbCustom
