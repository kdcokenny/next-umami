import Script, { ScriptProps } from 'next/script'
import React from 'react'

// https://umami.is/docs/tracker-configuration
interface Props extends Pick<ScriptProps, 'onLoad' | 'onReady' | 'onError'> {
  /**
   * The source of the script. Defaults to version hosted by Umami.
   */
  src?: string
  /**
   * Website ID found in Umami dashboard. https://umami.is/docs/collect-data
   */
  websiteId: string
  /**
   * By default, Umami will send data to wherever the script is located. You can override this to send data to another location.
   */
  hostUrl?: string
  /**
   * By default, Umami tracks all pageviews and events for you automatically. You can disable this behavior and track events yourself using the tracker functions.
   */
  autoTrack?: boolean
  /**
   * If you want the tracker to only run on specific domains, you can add them to your tracker script. This is a comma delimited list of domain names. Helps if you are working in a staging/development environment.
   */
  domains?: string | string[]
}

export default function UmamiProvider({
  src = 'https://cloud.umami.is/script.js',
  websiteId,
  autoTrack = true,
  ...props
}: Props) {
  return (
    <Script
      src={src}
      data-website-id={websiteId}
      data-auto-track={autoTrack}
      {...(props.hostUrl && { 'data-host-url': props.hostUrl })}
      {...(props.domains && {
        'data-domains': Array.isArray(props.domains)
          ? props.domains.join(',')
          : props.domains,
      })}
      /* Strategy recommended by Next.js for analytics https://nextjs.org/docs/app/api-reference/components/script#afterinteractive */
      strategy="afterInteractive"
      {...props}
    />
  )
}
