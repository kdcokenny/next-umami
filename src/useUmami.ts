import { useCallback } from 'react'

interface PageView {
  // Hostname of server
  hostname: string
  // Browser language
  language: string
  // Page referrer
  referrer: string
  // Screen dimensions (eg. 1920x1080)
  screen: string
  // Page title
  title: string
  // Page url
  url: string
  // Website ID (required)
  website: string
}

type EventName = string
type EventData = Record<string, string | number>

// https://umami.is/docs/tracker-functions
export default function useUmami() {
  const pageView = useCallback((data?: Partial<PageView>) => {
    try {
      ;(window as any).umami.pageview(data)
      return data
    } catch (error) {
      console.error('Failed to track pageview:', error)
    }
  }, [])

  const event = useCallback((name: EventName, data?: EventData) => {
    try {
      ;(window as any).umami.track(name, data)
      return { name, data }
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }, [])

  return { pageView, event }
}
