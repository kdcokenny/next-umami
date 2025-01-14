import type { ScriptProps } from 'next/script'
import type { ReactNode } from 'react'

// https://umami.is/docs/tracker-configuration
export interface UmamiProps
  extends Pick<ScriptProps, 'onLoad' | 'onReady' | 'onError'> {
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
  children?: ReactNode
}

export type NextUmamiProxyOptions = {
  /**
   * The path to the script. This can be any path. Defaults to '/script.js'.
   */
  clientScriptPath?: string
  /**
   * The location of the script you'd like to pull. Defaults to 'https://cloud.umami.is/script.js'.
   */
  serverScriptDestination?: string
  /**
   * The path to the API. Defaults to '/'. This can be any path but this will ALWAYS end with '/api/send' due to a restriction in the Umami script.
   */
  clientApiPath?: string
  /**
   * The location of the API you'd like to pull. Defaults to 'https://api-gateway.umami.dev/api/send'.
   */
  serverApiDestination?: string
}
