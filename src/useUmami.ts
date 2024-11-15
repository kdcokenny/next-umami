'use client'
import { useCallback, useEffect, useState } from 'react'

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

interface QueuedEvent {
  type: 'pageView' | 'event'
  payload: {
    name?: EventName
    data?: Partial<PageView> | EventData
  }
  timestamp: number
}

// https://umami.is/docs/tracker-functions
export default function useUmami() {
  const [isClient, setIsClient] = useState(false)
  const [eventQueue, setEventQueue] = useState<QueuedEvent[]>([])

  useEffect(() => {
    setIsClient(true) // this will be set to true only in the client
  }, [])

  const isUmamiAvailable = useCallback(() => {
    return isClient && typeof (window as any).umami !== 'undefined'
  }, [isClient])

  useEffect(() => {
    if (!isClient) return

    const processQueue = () => {
      if (!isUmamiAvailable()) return

      while (eventQueue.length > 0) {
        const event = eventQueue[0]
        if (event.type === 'pageView') {
          ; (window as any).umami?.track(event.payload.data)
        } else {
          ; (window as any).umami?.track(
            event.payload.name as string,
            event.payload.data
          )
        }
        setEventQueue((queue) => queue.slice(1))
      }
    }

    const intervalId = setInterval(() => {
      if (isUmamiAvailable()) {
        processQueue()
        if (eventQueue.length === 0) {
          clearInterval(intervalId)
        }
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isClient, isUmamiAvailable, eventQueue])

  const pageView = useCallback(
    (data?: Partial<PageView>) => {
      const fullData = {
        ...(data || {}),
      }

      if (!isUmamiAvailable()) {
        console.warn('UmamiProvider not found, queueing pageView')
        setEventQueue((queue) => [
          ...queue,
          {
            type: 'pageView',
            payload: { data: fullData },
            timestamp: Date.now(),
          },
        ])
        return fullData
      }

      ; (window as any).umami?.track(fullData)
      return fullData
    },
    [isUmamiAvailable]
  )

  const event = useCallback(
    (name: EventName, data?: EventData) => {
      if (!isUmamiAvailable()) {
        console.warn('UmamiProvider not found, queueing event')
        setEventQueue((queue) => [
          ...queue,
          {
            type: 'event',
            payload: { name, data },
            timestamp: Date.now(),
          },
        ])
        return { name, data }
      }

      ; (window as any).umami?.track(name, { ...(data && { ...data }) })
      return { name, data: { ...(data && { ...data }) } }
    },
    [isUmamiAvailable]
  )

  return { pageView, event }
}
