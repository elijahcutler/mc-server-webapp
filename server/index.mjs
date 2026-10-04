// Zero-dependency HTTP server for the static site.
//
// - POST /api/request-access forwards access requests to Discord.
// - When STATIC_DIR is set, it also serves the built site, so a single small
//   process can host everything. Behind Caddy/nginx you can leave STATIC_DIR
//   unset and only proxy /api/* here.

import { createServer } from "node:http"
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { extname, join, normalize, resolve, sep } from "node:path"
import { handleAccessRequest } from "./request-access.mjs"

const MAX_BODY_BYTES = 4 * 1024

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
}

/**
 * @param {import("node:http").IncomingMessage} req
 * @returns {Promise<unknown>}
 */
function readJson(req) {
  return new Promise((resolveBody) => {
    let size = 0
    /** @type {Buffer[]} */
    const chunks = []
    req.on("data", (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        resolveBody(null)
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on("end", () => {
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString("utf8")))
      } catch {
        resolveBody(null)
      }
    })
    req.on("error", () => resolveBody(null))
  })
}

/**
 * @param {import("node:http").ServerResponse} res
 * @param {number} status
 * @param {unknown} body
 */
function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" })
  res.end(JSON.stringify(body))
}

/**
 * @param {string} root
 * @param {string} urlPath
 */
async function resolveStaticFile(root, urlPath) {
  let decoded
  try {
    decoded = decodeURIComponent(urlPath)
  } catch {
    return null
  }
  const candidate = normalize(join(root, decoded))
  if (candidate !== root && !candidate.startsWith(root + sep)) return null

  for (const path of [candidate, join(candidate, "index.html"), `${candidate}.html`]) {
    try {
      const info = await stat(path)
      if (info.isFile()) return { path, size: info.size }
    } catch {
      // try the next candidate
    }
  }
  return null
}

/**
 * @param {{ staticDir?: string, webhookUrl?: string, trustProxy?: boolean }} options
 */
export function createAppServer({ staticDir, webhookUrl, trustProxy = false } = {}) {
  const root = staticDir ? resolve(staticDir) : undefined

  return createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost")

    if (url.pathname === "/api/request-access") {
      if (req.method !== "POST") {
        res.setHeader("Allow", "POST")
        return sendJson(res, 405, { ok: false, error: "Method not allowed." })
      }
      const forwarded = trustProxy ? String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() : ""
      const result = await handleAccessRequest({
        body: await readJson(req),
        ip: forwarded || req.socket.remoteAddress || "unknown",
        webhookUrl,
      })
      return sendJson(res, result.status, result.body)
    }

    if (url.pathname === "/healthz") return sendJson(res, 200, { ok: true })

    if (!root || (req.method !== "GET" && req.method !== "HEAD")) {
      return sendJson(res, 404, { ok: false, error: "Not found." })
    }

    const file = (await resolveStaticFile(root, url.pathname)) ?? (await resolveStaticFile(root, "/404.html"))
    if (!file) return sendJson(res, 404, { ok: false, error: "Not found." })

    const isNotFound = file.path.endsWith(`${sep}404.html`) && !url.pathname.startsWith("/404")
    const immutable = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_astro/")
    res.writeHead(isNotFound ? 404 : 200, {
      "Content-Type": MIME_TYPES[/** @type {keyof typeof MIME_TYPES} */ (extname(file.path))] ?? "application/octet-stream",
      "Content-Length": file.size,
      "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    })
    if (req.method === "HEAD") return res.end()
    createReadStream(file.path).pipe(res)
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 8787)
  const host = process.env.HOST || "127.0.0.1"
  const server = createAppServer({
    staticDir: process.env.STATIC_DIR,
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    trustProxy: process.env.TRUST_PROXY === "1",
  })
  server.listen(port, host, () => {
    console.log(`Listening on http://${host}:${port}${process.env.STATIC_DIR ? ` (serving ${process.env.STATIC_DIR})` : ""}`)
  })
}
