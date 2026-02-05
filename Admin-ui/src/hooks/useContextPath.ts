import { useLocation } from '@tanstack/react-router'

/**
 * Hook to get the current context prefix (e.g., '/search') and build paths
 * that maintain the navigation hierarchy.
 */
export function useContextPath() {
  const location = useLocation()
  const pathname = location.pathname
  
  // Check if we're in the search flow
  const isInSearchContext = pathname.startsWith('/search/')
  
  // Get the context prefix
  const contextPrefix = isInSearchContext ? '/search' : ''
  
  /**
   * Build a path that maintains the current context
   * @param basePath - The base path without context (e.g., '/commission/processcommission')
   * @returns The full path with context prefix if applicable
   */
  const buildPath = (basePath: string): string => {
    if (!basePath.startsWith('/')) {
      basePath = '/' + basePath
    }
    return contextPrefix + basePath
  }
  
  return {
    isInSearchContext,
    contextPrefix,
    buildPath,
  }
}
