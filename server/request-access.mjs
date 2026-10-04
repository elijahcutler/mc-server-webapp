// Framework-agnostic handler for the "Request Access" form.
// The Discord webhook URL is read from a server-only env var so it never
// reaches the browser bundle.

const MINECRAFT_USERNAME = /^[A-Za-z0-9_]{3,16}$/
// New-style Discord usernames, plus legacy name#1234 tags.
const DISCORD_USERNAME = /^(?:[a-z0-9_.]{2,32}|[^@#:`]{2,32}#\d{4})$/i

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3
const MAX_TRACKED_IPS = 10_000

/** @type {Map<string, number[]>} */
const recentRequests = new Map()

/**
 * Returns true if the IP has exceeded the request budget for the window.
 * @param {string} ip
 * @param {number} now
 */
export function isRateLimited(ip, now = Date.now()) {
  const recent = (recentRequests.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    recentRequests.set(ip, recent)
    return true
  }
  recent.push(now)
  recentRequests.delete(ip)
  recentRequests.set(ip, recent)
  // Map preserves insertion order, so the first key is the least recently seen IP.
  if (recentRequests.size > MAX_TRACKED_IPS) {
    recentRequests.delete(recentRequests.keys().next().value)
  }
  return false
}

export function resetRateLimits() {
  recentRequests.clear()
}

/** @param {string} text */
function escapeMarkdown(text) {
  return text.replace(/([\\`*_~|>#\[\]()-])/g, "\\$1")
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, discord: string, minecraft: string } | { ok: false, error: string }}
 */
export function validateRequest(body) {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request body." }
  const { discordUsername, minecraftUsername, website } = /** @type {Record<string, unknown>} */ (body)

  // Honeypot field: real users never see or fill it.
  if (typeof website === "string" && website.length > 0) return { ok: false, error: "Invalid request." }

  const discord = typeof discordUsername === "string" ? discordUsername.trim() : ""
  const minecraft = typeof minecraftUsername === "string" ? minecraftUsername.trim() : ""

  if (!DISCORD_USERNAME.test(discord)) return { ok: false, error: "Enter a valid Discord username." }
  if (!MINECRAFT_USERNAME.test(minecraft)) {
    return { ok: false, error: "Minecraft usernames are 3-16 letters, numbers or underscores." }
  }
  return { ok: true, discord, minecraft }
}

/**
 * @param {{
 *   body: unknown,
 *   ip: string,
 *   webhookUrl: string | undefined,
 *   fetchImpl?: typeof fetch,
 *   now?: number,
 * }} options
 * @returns {Promise<{ status: number, body: { ok: boolean, error?: string } }>}
 */
export async function handleAccessRequest({ body, ip, webhookUrl, fetchImpl = fetch, now = Date.now() }) {
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL is not configured")
    return { status: 503, body: { ok: false, error: "Access requests are not configured on this server." } }
  }

  const result = validateRequest(body)
  if (!result.ok) return { status: 400, body: { ok: false, error: result.error } }

  if (isRateLimited(ip, now)) {
    return { status: 429, body: { ok: false, error: "Too many requests. Please try again later." } }
  }

  try {
    const response = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `**New Access Request**\nDiscord: ${escapeMarkdown(result.discord)}\nMinecraft: ${escapeMarkdown(result.minecraft)}`,
        // Never let user input ping @everyone, roles or users.
        allowed_mentions: { parse: [] },
      }),
    })
    if (!response.ok) throw new Error(`Discord responded with ${response.status}`)
  } catch (error) {
    console.error("Failed to forward access request:", error)
    return { status: 502, body: { ok: false, error: "Could not send your request. Please try again later." } }
  }

  return { status: 200, body: { ok: true } }
}
