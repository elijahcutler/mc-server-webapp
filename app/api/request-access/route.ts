import { handleAccessRequest } from "@/server/request-access.mjs"

export async function POST(request: Request) {
  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    // Fall through: validation rejects a null body.
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const result = await handleAccessRequest({
    body,
    ip,
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
  })
  return Response.json(result.body, { status: result.status })
}
