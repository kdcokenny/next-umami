import type {
  PageView,
  UmamiIdentifyArguments,
  UmamiTrackArguments,
} from './common'

export type QueuedUmamiCall =
  | { method: 'track'; args: UmamiTrackArguments }
  | { method: 'identify'; args: UmamiIdentifyArguments }

export type UmamiTracker = {
  track: (...args: UmamiTrackArguments) => unknown
  identify?: (...args: UmamiIdentifyArguments) => unknown
}

export function createPageViewTrackArguments(
  data?: Partial<PageView>
): UmamiTrackArguments {
  if (!data) return []

  return [(properties) => ({ ...properties, ...data })]
}

function isUmamiReadyFor(
  tracker: UmamiTracker | undefined,
  method: QueuedUmamiCall['method']
) {
  if (!tracker) return false
  if (method === 'identify') return typeof tracker.identify === 'function'

  return typeof tracker.track === 'function'
}

export function flushQueuedCalls(
  queue: QueuedUmamiCall[],
  getTracker: () => UmamiTracker | undefined
) {
  for (const [index, queuedCall] of queue.entries()) {
    const tracker = getTracker()

    if (!isUmamiReadyFor(tracker, queuedCall.method)) {
      return queue.slice(index)
    }

    if (queuedCall.method === 'identify') {
      tracker?.identify?.(...queuedCall.args)
      continue
    }

    tracker?.track(...queuedCall.args)
  }

  return []
}

export function isQueuedCallReadyForTracker(
  queuedCall: QueuedUmamiCall,
  tracker: UmamiTracker | undefined
) {
  return isUmamiReadyFor(tracker, queuedCall.method)
}
