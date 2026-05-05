import assert from 'node:assert/strict'
import type {
  PageView,
  UmamiPageViewTransformer,
  UmamiTrackArguments,
} from '../src/common'
import {
  createPageViewTrackArguments,
  flushQueuedCalls,
  type QueuedUmamiCall,
  type UmamiTracker,
} from '../src/tracker'

const pageViewProperties: PageView = {
  hostname: 'example.com',
  language: 'en-US',
  referrer: 'https://example.com/from',
  screen: '1920x1080',
  title: 'Home',
  url: '/',
  website: 'site-id',
}

const defaultPageViewArgs = createPageViewTrackArguments()
assert.deepEqual(defaultPageViewArgs, [])

const customPageViewArgs = createPageViewTrackArguments({
  url: '/custom-pageview',
})
assert.equal(customPageViewArgs.length, 1)
assert.equal(typeof customPageViewArgs[0], 'function')

const transformPageView = customPageViewArgs[0] as UmamiPageViewTransformer
const transformedPageView = transformPageView(pageViewProperties)

assert.deepEqual(transformedPageView, {
  ...pageViewProperties,
  url: '/custom-pageview',
})

const queuedCalls: QueuedUmamiCall[] = [
  { method: 'track', args: defaultPageViewArgs },
  { method: 'track', args: customPageViewArgs },
]

const pendingCalls = flushQueuedCalls(queuedCalls, () => undefined)
assert.equal(pendingCalls[0], queuedCalls[0])
assert.equal(pendingCalls[1], queuedCalls[1])

const flushedTrackArgs: UmamiTrackArguments[] = []
const tracker: UmamiTracker = {
  track: (...args) => {
    flushedTrackArgs.push(args)
  },
}

const remainingCalls = flushQueuedCalls(pendingCalls, () => tracker)

assert.deepEqual(remainingCalls, [])
assert.deepEqual(flushedTrackArgs[0], [])
assert.equal(flushedTrackArgs[1][0], transformPageView)
assert.deepEqual(
  (flushedTrackArgs[1][0] as UmamiPageViewTransformer)(pageViewProperties),
  {
    ...pageViewProperties,
    url: '/custom-pageview',
  }
)

console.log('Pageview tracking verification passed')
