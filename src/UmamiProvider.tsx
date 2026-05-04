'use client'

import Script from 'next/script'
import React, { useEffect, useMemo, useState } from 'react'
import type {
  NextUmamiProxyOptions,
  UmamiBeforeSend,
  UmamiPayload,
  UmamiProps,
} from './common'
type RequiredKeys<T> = {
  [K in keyof Required<T>]-?: T[K] | undefined
}

const BEFORE_SEND_GLOBAL_PREFIX = '__nextUmamiBeforeSend'

declare global {
  interface Window {
    [key: string]: unknown
  }
}

function createBeforeSendGlobalName() {
  const randomValue = Math.random().toString(36).slice(2)
  return `${BEFORE_SEND_GLOBAL_PREFIX}_${Date.now().toString(36)}_${randomValue}`
}

function toSafeBeforeSend(callback: UmamiBeforeSend) {
  return (type: string, payload: UmamiPayload) => {
    try {
      return callback(type, payload) || false
    } catch (error) {
      console.warn('Umami beforeSend failed; request cancelled')
      return false
    }
  }
}

export default function UmamiProvider({
  src = 'https://cloud.umami.is/script.js',
  websiteId,
  autoTrack = true,
  hostUrl,
  domains,
  beforeSend,
  performance,
  children,
  ...props
}: UmamiProps) {
  const beforeSendGlobalName = useMemo(() => {
    if (typeof beforeSend !== 'function') return undefined

    return createBeforeSendGlobalName()
  }, [beforeSend])
  const [registeredBeforeSendName, setRegisteredBeforeSendName] = useState<
    string | undefined
  >(() => (typeof beforeSend === 'string' ? beforeSend : undefined))

  useEffect(() => {
    if (typeof beforeSend === 'string') {
      setRegisteredBeforeSendName(beforeSend)
      return
    }

    if (!beforeSendGlobalName || typeof beforeSend !== 'function') {
      setRegisteredBeforeSendName(undefined)
      return
    }

    window[beforeSendGlobalName] = toSafeBeforeSend(beforeSend)
    setRegisteredBeforeSendName(beforeSendGlobalName)

    return () => {
      if (window[beforeSendGlobalName]) {
        delete window[beforeSendGlobalName]
      }
      setRegisteredBeforeSendName(undefined)
    }
  }, [beforeSend, beforeSendGlobalName])

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
  const shouldWaitForBeforeSendRegistration =
    typeof beforeSend === 'function' && !registeredBeforeSendName

  if (shouldWaitForBeforeSendRegistration) {
    return <>{children}</>
  }

  return (
    <>
      <Script
        src={proxyOptions?.clientScriptPath ?? src}
        data-website-id={websiteId}
        data-auto-track={autoTrack}
        {...(performance && { 'data-performance': 'true' })}
        {...(registeredBeforeSendName && {
          'data-before-send': registeredBeforeSendName,
        })}
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
