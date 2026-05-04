'use client'

import { useCallback, useEffect, useRef } from 'react'
import type {
  PageView,
  UmamiEventData,
  UmamiIdentifyArguments,
  UmamiTrackArguments,
} from './common'

type QueuedUmamiCall =
  | { method: 'track'; args: UmamiTrackArguments }
  | { method: 'identify'; args: UmamiIdentifyArguments }

type UmamiTracker = {
  track: (...args: UmamiTrackArguments) => unknown
  identify?: (...args: UmamiIdentifyArguments) => unknown
}

declare global {
  interface Window {
    umami?: UmamiTracker
  }
}

function getUmamiTracker() {
  if (typeof window === 'undefined') return undefined

  return window.umami
}

function isUmamiReadyFor(method: QueuedUmamiCall['method']) {
  const tracker = getUmamiTracker()

  if (!tracker) return false
  if (method === 'identify') return typeof tracker.identify === 'function'

  return typeof tracker.track === 'function'
}

function warnIfDistinctIdIsLong(id: string) {
  if (id.length <= 50) return

  console.warn('Umami distinct IDs should be 50 characters or fewer')
}

function parseIdentifyArguments(args: UmamiIdentifyArguments) {
  const [firstArgument] = args

  if (typeof firstArgument !== 'string') return args
  if (firstArgument.length > 0) {
    warnIfDistinctIdIsLong(firstArgument)
    return args
  }

  throw new Error('Umami distinct ID must be a non-empty string')
}

function flushQueuedCalls(queue: QueuedUmamiCall[]) {
  for (const [index, queuedCall] of queue.entries()) {
    const tracker = getUmamiTracker()

    if (!tracker || !isUmamiReadyFor(queuedCall.method)) {
      return queue.slice(index)
    }

    if (queuedCall.method === 'identify') {
      tracker.identify?.(...queuedCall.args)
      continue
    }

    tracker.track(...queuedCall.args)
  }

  return []
}

// https://umami.is/docs/tracker-functions
export default function useUmami() {
  const eventQueue = useRef<QueuedUmamiCall[]>([])

  const flushQueue = useCallback(() => {
    if (eventQueue.current.length === 0) return

    eventQueue.current = flushQueuedCalls(eventQueue.current)
  }, [])

  useEffect(() => {
    flushQueue()

    const intervalId = window.setInterval(flushQueue, 1000)

    return () => window.clearInterval(intervalId)
  }, [flushQueue])

  const enqueueOrSend = useCallback(
    (queuedCall: QueuedUmamiCall) => {
      flushQueue()

      if (eventQueue.current.length > 0) {
        console.warn(`Umami tracker unavailable; queueing ${queuedCall.method}`)
        eventQueue.current = [...eventQueue.current, queuedCall]
        return
      }

      const tracker = getUmamiTracker()
      if (!tracker || !isUmamiReadyFor(queuedCall.method)) {
        console.warn(`Umami tracker unavailable; queueing ${queuedCall.method}`)
        eventQueue.current = [...eventQueue.current, queuedCall]
        return
      }

      if (queuedCall.method === 'identify') {
        tracker.identify?.(...queuedCall.args)
        return
      }

      tracker.track(...queuedCall.args)
    },
    [flushQueue]
  )

  const track = useCallback(
    (...args: UmamiTrackArguments) => {
      enqueueOrSend({ method: 'track', args })
    },
    [enqueueOrSend]
  )

  const identify = useCallback(
    (...args: UmamiIdentifyArguments) => {
      enqueueOrSend({ method: 'identify', args: parseIdentifyArguments(args) })
    },
    [enqueueOrSend]
  )

  const pageView = useCallback(
    (data?: Partial<PageView>) => {
      const fullData = { ...(data || {}) }

      track(fullData)
      return fullData
    },
    [track]
  )

  const event = useCallback(
    (name: string, data?: UmamiEventData) => {
      if (!data) {
        track(name)
        return { name, data }
      }

      const eventData = { ...data }
      track(name, eventData)
      return { name, data: eventData }
    },
    [track]
  )

  return { pageView, event, track, identify }
}
