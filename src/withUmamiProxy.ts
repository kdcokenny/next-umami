import type { NextConfig } from 'next'

export default function withUmamiProxy() {
  ;(nextConfig: NextConfig): NextConfig => {
    return {
      rewrites: async () => {
        const umamiRewrites = [
          {
            source: 'https://cloud.umami.is/script.js',
            destination: '/script.js',
          },
        ]
        if (process.env.NEXT_PLAUSIBLE_DEBUG) {
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
