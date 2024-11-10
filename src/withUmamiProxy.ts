import { NextConfig } from 'next'
import { NextUmamiProxyOptions } from './common'
import { Rewrite } from 'next/dist/lib/load-custom-routes'

type NextUmamiEnv = { next_umami_proxy: 'true' } & {
  [K in keyof Required<NextUmamiProxyOptions> as `next_umami_${K}`]:
    | string
    | undefined
}

export default function withUmamiProxy(
  options: NextUmamiProxyOptions = {}
): NextConfig {
  return (nextConfig: NextConfig): NextConfig => {
    const nextUmamiEnv: NextUmamiEnv = {
      next_umami_proxy: 'true',
      next_umami_clientScriptPath: options.clientScriptPath ?? '/script.js',
      next_umami_serverScriptDestination:
        options.serverScriptDestination ?? 'https://cloud.umami.is/script.js',
      next_umami_clientApiPath: options.clientApiPath ?? '',
      next_umami_serverApiDestination:
        options.serverApiDestination ??
        'https://api-gateway.umami.dev/api/send',
    }

    return {
      ...nextConfig,
      env: {
        ...nextConfig.env,
        ...(Object.fromEntries(
          Object.entries(nextUmamiEnv).filter(
            ([_, value]) => value !== undefined
          )
        ) as Record<string, string>),
      },
      rewrites: async () => {
        const umamiRewrites = [
          {
            source: nextUmamiEnv.next_umami_clientScriptPath,
            destination: nextUmamiEnv.next_umami_serverScriptDestination,
          },
          {
            source: nextUmamiEnv.next_umami_clientApiPath + '/api/send',
            destination: nextUmamiEnv.next_umami_serverApiDestination,
          },
        ] as const as Rewrite[]

        if (process.env.NEXT_UMAMI_DEBUG) {
          console.log('umamiRewrites = ', umamiRewrites)
        }

        const rewrites = await nextConfig.rewrites?.()

        if (!rewrites) {
          return umamiRewrites
        } else if (Array.isArray(rewrites)) {
          return rewrites.concat(umamiRewrites)
        } else if (rewrites.afterFiles) {
          rewrites.afterFiles = rewrites.afterFiles.concat(umamiRewrites)
          return rewrites
        } else {
          rewrites.afterFiles = umamiRewrites
          return rewrites
        }
      },
    }
  }
}
