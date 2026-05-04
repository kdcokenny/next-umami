import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm', 'cjs'],
  banner: {
    js: "'use client'",
  },
  sourcemap: true,
  clean: true,
  dts: true,
  external: ['react', 'react-dom', 'next'],
})
