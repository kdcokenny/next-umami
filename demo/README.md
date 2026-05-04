This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

This demo is a separate Next.js 16 app and should run on Node.js 20.9.0 or newer. It currently depends on the local package with `"next-umami": "file:.."`. That installs `demo/node_modules/next-umami` as a link to the repository root, whose package exports point at generated `dist/*` files. Because root `dist/` is ignored and untracked, a fresh Vercel checkout must either build the root package before the demo build or use the published package instead.

### Option 1: production demo after `next-umami@2.0.2` publishes

Use this for the simplest Vercel setup. Change `demo/package.json` from `"next-umami": "file:.."` to `"next-umami": "^2.0.2"`, then regenerate `demo/package-lock.json`.

Recommended Vercel settings:

- **Root Directory:** `demo`
- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Output Directory:** leave blank for the Next.js default
- **Node.js Version:** 20.9.0 or newer
- **Environment Variable:** set `NEXT_PUBLIC_UMAMI_WEBSITE_ID` to the website ID from your Umami dashboard

The demo provider sets `domains="next-umami.vercel.app"`. For production, update that value in `app/layout.js` to your Vercel domain. For preview deployments, remove the prop or include the preview domain pattern you want to allow.

### Option 2: repository/local-source deployment with `file:..`

Use a monorepo-style Vercel build that includes the repository root and builds the package before the demo. For example:

- **Root Directory:** repository root
- **Install Command:** `npm install`
- **Build Command:** `npm install && npm run build && cd demo && npm install && npm run build`
- **Node.js Version:** 20.9.0 or newer
- **Environment Variable:** set `NEXT_PUBLIC_UMAMI_WEBSITE_ID`

Equivalent settings are fine as long as they build the root package first and then build `demo`. Plain `Root Directory: demo` with the default build can fail while `"next-umami": "file:.."` is active because root `dist/` is not committed.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
