# next-umami

Simple integration for https://nextjs.org and https://umami.is analytics.

## Usage

### Include the Analytics Script

To enable Umami analytics in your Next.js app you'll need to expose the Umami context.

If you're using the [app router](https://nextjs.org/docs/getting-started/project-structure#app-routing-conventions) include `UmamiProvider` inside the root layout:

```jsx
// app/layout.js
import UmamiProvider from 'next-umami'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <UmamiProvider websiteId="a3d85e62-dc8b-4d4b-bd1f-e8a71b55d3cf" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

If you're using the [pages router](https://nextjs.org/docs/getting-started/project-structure#pages-routing-conventions) include the `UmamiProvider` inside `_app.js`:

```jsx
// pages/_app.js
import UmamiProvider from 'next-umami'

export default function MyApp({ Component, pageProps }) {
  return (
    <UmamiProvider websiteId="a3d85e62-dc8b-4d4b-bd1f-e8a71b55d3cf">
      <Component {...pageProps} />
    </UmamiProvider>
  )
}
```

If you want to enable Umami analytics only on a single page you can wrap the page in a `UmamiProvider` component:

```jsx
// pages/home.js
import UmamiProvider from 'next-umami'

export default function Home() {
  return (
    <UmamiProvider websiteId="a3d85e62-dc8b-4d4b-bd1f-e8a71b55d3cf">
      <h1>My Site</h1>
      {/* ... */}
    </UmamiProvider>
  )
}
```

#### `UmamiProvider` Props

| Name           | Type                        | Description                                                                                                                                                                                                                                                                               |
| -------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `websiteId`    | `string`                    | Website ID found in Umami dashboard. https://umami.is/docs/collect-data.                                                                                                                                                                                                                  |
| `src?`         | `string`                    | By default it's set to https://cloud.umami.is/script.js. You can override this in case you're self-hosting.                                                                                                                                                                               |
| `hostUrl?`     | `string`                    | By default, Umami will send data to wherever the script is located. You can override this to send data to another location. [See in docs](https://umami.is/docs/tracker-configuration#data-host-url).                                                                                     |
| `autoTrack?`   | `boolean`                   | By default, Umami tracks all pageviews and events for you automatically. You can disable this behavior and track events yourself using the tracker functions. [See in docs](https://umami.is/docs/tracker-configuration#data-auto-track).                                                 |
| `domains?`     | `string \| string[]`        | If you want the tracker to only run on specific domains, you can add them to your tracker script. This is a comma delimited list of domain names. Helps if you are working in a staging/development environment. [See in docs](https://umami.is/docs/tracker-configuration#data-domains). |
| `beforeSend?`  | `string \| UmamiBeforeSend` | Sets `data-before-send`. Strings are passed directly; functions are registered on `window` with a package-prefixed generated name.                                                                                                                                                        |
| `performance?` | `boolean`                   | When true, sets `data-performance="true"` for Umami performance collection.                                                                                                                                                                                                               |
| `onLoad?`      | `(e: any) => void`          | Execute code after Umami has loaded.                                                                                                                                                                                                                                                      |
| `onReady?`     | `() => void \| null`        | Execute code after Umami's load event when it first loads and then after every subsequent component re-mount.                                                                                                                                                                             |
| `onError?`     | `(e: any) => void`          | Handle errors if Umami fails to load.                                                                                                                                                                                                                                                     |

`beforeSend` can modify or cancel outgoing requests on Umami tracker versions that support `data-before-send`:

```jsx
<UmamiProvider
  websiteId="a3d85e62-dc8b-4d4b-bd1f-e8a71b55d3cf"
  beforeSend={(type, payload) => {
    if (type === 'event' && payload.name === 'Internal Event') return false

    return {
      ...payload,
      data: {
        ...(payload.data || {}),
        app: 'marketing-site',
      },
    }
  }}
/>
```

Return a payload object to send modified data. Return `false`, `null`, or `undefined` to cancel. Thrown errors are caught, logged without payload details, and cancel the request. Prefer removing or hashing sensitive data; do not log raw payloads, emails, or user identifiers from this callback. If you pass a function from an app-router server layout, move that provider usage behind a client boundary because functions are client-only props.

### Umami tracker compatibility

Core `pageView`, `event`, script loading, and proxy behavior remain usable with older Umami trackers. Newer tracker features require newer Umami versions: `identify`/distinct IDs and `data-before-send` were introduced in Umami v2.18.0 (`v2.18.1` or newer is recommended for identify fixes), while `data-performance` requires Umami v3.1.0 or newer.

### Proxying Umami Requests

To improve performance and avoid ad blockers that might interfere with your analytics, you can proxy Umami's tracking script and API through your own domain. Update your `next.config.mjs`:

```mjs
/** @type {import('next').NextConfig} */
import { withUmamiProxy } from 'next-umami'

const nextConfig = withUmamiProxy({
  clientApiPath: '/events',
  clientScriptPath: '/js/script.js',
})({
  // Your existing Next.js configuration
  reactStrictMode: true,
})

export default nextConfig
```

The `withUmamiProxy` function accepts these options:

| Name                       | Type     | Description                                                                       |
| -------------------------- | -------- | --------------------------------------------------------------------------------- |
| `clientScriptPath?`        | `string` | Path where Umami script will be served. Defaults to `/script.js`                  |
| `serverScriptDestination?` | `string` | Original Umami script URL. Defaults to `https://cloud.umami.is/script.js`         |
| `clientApiPath?`           | `string` | Path where tracking data will be sent. Defaults to `/`                            |
| `serverApiDestination?`    | `string` | Original Umami API endpoint. Defaults to `https://api-gateway.umami.dev/api/send` |

## Send Custom Events

The `useUmami` hook exposes functions that you can call on your website if you want more control over your tracking.
By default, everything is automatically collected, but you can disable this using `autoTrack={false}` in `UmamiProvider` and send the data yourself.

### Pageview

Default properties are automatically sent. If you wish to override any property, use the `umami.pageView` function like this:

```jsx
import { useEffect } from 'react'
import { useUmami } from 'next-umami'

export default function Page() {
  const umami = useUmami()

  useEffect(() => {
    // Default Pageview
    umami.pageView()
  }, [umami.pageView])

  return (
    <button onClick={() => umami.pageView({ url: '/custom-pageview' })}>
      Send custom pageview
    </button>
  )
}
```

#### `Pageview` Props

| Name        | Type     | Description                        |
| ----------- | -------- | ---------------------------------- |
| `hostname?` | `string` | Hostname of server                 |
| `language?` | `string` | Browser language                   |
| `referrer?` | `string` | Page referrer                      |
| `screen?`   | `string` | Screen dimensions (e.g. 1920x1080) |
| `title?`    | `string` | Page title                         |
| `url?`      | `string` | Page URL                           |

### Events

Access the `umami.event` function like this:

```jsx
import { useUmami } from 'next-umami'

export default function UmamiButtons() {
  const umami = useUmami()

  return (
    <>
      {/* Basic Event */}
      <button onClick={() => umami.event('Basic Event')}>Submit</button>

      {/* Custom Event */}
      <button
        onClick={() =>
          umami.event('Custom Event', {
            userAgent: window.navigator.userAgent,
          })
        }
      >
        Submit with custom data
      </button>
    </>
  )
}
```

### Low-level `track`

`track` forwards to Umami's tracker overloads and queues calls until `window.umami.track` is available:

```jsx
umami.track()
umami.track((props) => ({ ...props, url: '/custom-pageview' }))
umami.track('Signup')
umami.track('Signup', { plan: 'pro', trial: true })
umami.track('Signup', { plan: 'pro' }, { timestamp: Date.now() })
```

Use the function form for custom pageview overrides so Umami's default pageview properties, including `website`, are preserved.

### Identify visitors

`identify` forwards to Umami's identify API and queues calls until available:

```jsx
umami.identify('visitor_123')
umami.identify({ plan: 'pro' })
umami.identify('visitor_123', { plan: 'pro' })
```

Distinct IDs must be non-empty strings. Umami recommends IDs of 50 characters or fewer; longer values warn in development instead of failing so existing IDs keep working.

For privacy, hash stable identifiers before sending them:

```jsx
import { createUmamiDistinctId, useUmami } from 'next-umami'

async function identifyUser(email, umami) {
  const distinctId = await createUmamiDistinctId(email, {
    salt: process.env.NEXT_PUBLIC_UMAMI_ID_SALT,
  })

  umami.identify(distinctId)
}
```

`createUmamiDistinctId(input, options)` uses SHA-256 through Web Crypto, lower-case hex output, and truncates to `maxLength` (default 50, allowed 1-50). It throws for empty input, invalid length, or missing Web Crypto support, and never logs or stores the input.

#### `Event` Props

| Name    | Type             | Description               |
| ------- | ---------------- | ------------------------- |
| `name`  | `string`         | Name of the event         |
| `data?` | `UmamiEventData` | Custom data for the event |

- Numbers have a max precision of 4.
- Strings have a max length of 500.
- Arrays are converted to a String, with the same max length of 500.
- Objects have a max of 50 properties. Arrays are considered 1 property.
