import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js"

const apiOrigin = process.env.API_ORIGIN || "http://127.0.0.1:8787"

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  // Production builds are plain static files in out/. During `next dev`,
  // proxy the API to the standalone server (npm run dev:api).
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      images: { unoptimized: true },
      async rewrites() {
        return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }]
      },
    }
  }
  return {
    output: "export",
    images: { unoptimized: true },
  }
}
