import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to the top when the route pathname changes (full page navigations).
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
