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
  const isUmamiAvailable = useCallback(() => {
    return typeof (window as any).umami !== 'undefined'
  }, [])

  const pageView = useCallback(
    (data?: Partial<PageView>) => {
      if (!isUmamiAvailable()) {
        console.warn('UmamiProvider not found')
        return
      }

      try {
        ;(window as any).umami.pageview(data)
        return data
      } catch (error) {
        console.error('Failed to track pageview:', error)
      }
    },
    [isUmamiAvailable]
  )

  const event = useCallback(
    (name: EventName, data?: EventData) => {
      if (!isUmamiAvailable()) {
        console.warn('UmamiProvider not found')
        return
      }

      try {
        ;(window as any).umami.track(name, data)
        return { name, data }
      } catch (error) {
        console.error('Failed to track event:', error)
      }
    },
    [isUmamiAvailable]
  )

  return { pageView, event }
}
