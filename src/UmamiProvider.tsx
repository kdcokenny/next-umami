import Script from 'next/script'
import React from 'react'
import type { NextUmamiProxyOptions, UmamiProps } from './common'
type RequiredKeys<T> = {
  [K in keyof Required<T>]-?: T[K] | undefined
}

export default function UmamiProvider({
  src = 'https://cloud.umami.is/script.js',
  websiteId,
  autoTrack = true,
  hostUrl,
  domains,
  children,
  ...props
}: UmamiProps) {
  const proxyOptions: RequiredKeys<NextUmamiProxyOptions> | undefined = process
    .env.next_umami_proxy
    ? {
        clientScriptPath: process.env.next_umami_clientScriptPath,
        serverScriptDestination: process.env.next_umami_serverScriptDestination,
        clientApiPath: process.env.next_umami_clientApiPath,
        serverApiDestination: process.env.next_umami_serverApiDestination,
      }
    : undefined

  const effectiveHostUrl = proxyOptions?.clientApiPath || hostUrl

  return (
    <>
      <Script
        src={proxyOptions?.clientScriptPath ?? src}
        data-website-id={websiteId}
        data-auto-track={autoTrack}
        {...(effectiveHostUrl && { 'data-host-url': effectiveHostUrl })}
        {...(domains && {
          'data-domains': Array.isArray(domains) ? domains.join(',') : domains,
        })}
        /* Strategy recommended by Next.js for analytics https://nextjs.org/docs/app/api-reference/components/script#afterinteractive */
        strategy="afterInteractive"
        {...props}
      />
      {children}
    </>
  )
}
