import { test, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { handleAccessRequest, resetRateLimits, validateRequest } from "./request-access.mjs"

const WEBHOOK = "https://discord.example/webhook"
const valid = { discordUsername: "steve.builder", minecraftUsername: "Steve_123" }

function fakeFetch(status = 204) {
  const calls = []
  const impl = async (url, init) => {
    calls.push({ url, init })
    return { ok: status >= 200 && status < 300, status }
  }
  return { impl, calls }
}

beforeEach(() => resetRateLimits())

test("forwards a valid request without allowing mentions", async () => {
  const { impl, calls } = fakeFetch()
  const res = await handleAccessRequest({ body: valid, ip: "1.1.1.1", webhookUrl: WEBHOOK, fetchImpl: impl })
  assert.equal(res.status, 200)
  assert.equal(calls.length, 1)
  const payload = JSON.parse(calls[0].init.body)
  assert.deepEqual(payload.allowed_mentions, { parse: [] })
  assert.match(payload.content, /Steve\\_123/)
})

test("returns 503 when the webhook is not configured", async () => {
  const res = await handleAccessRequest({ body: valid, ip: "1.1.1.1", webhookUrl: undefined })
  assert.equal(res.status, 503)
})

test("rejects invalid usernames", () => {
  assert.equal(validateRequest({ discordUsername: "@everyone", minecraftUsername: "Steve" }).ok, false)
  assert.equal(validateRequest({ discordUsername: "steve", minecraftUsername: "no spaces" }).ok, false)
  assert.equal(validateRequest({ discordUsername: "steve", minecraftUsername: "ab" }).ok, false)
  assert.equal(validateRequest(null).ok, false)
})

test("accepts legacy discord tags", () => {
  assert.equal(validateRequest({ discordUsername: "Steve#1234", minecraftUsername: "Steve" }).ok, true)
})

test("rejects honeypot submissions", () => {
  assert.equal(validateRequest({ ...valid, website: "http://spam" }).ok, false)
})

test("rate limits repeated requests from one IP", async () => {
  const { impl, calls } = fakeFetch()
  const statuses = []
  for (let i = 0; i < 4; i++) {
    const res = await handleAccessRequest({ body: valid, ip: "2.2.2.2", webhookUrl: WEBHOOK, fetchImpl: impl })
    statuses.push(res.status)
  }
  assert.deepEqual(statuses, [200, 200, 200, 429])
  assert.equal(calls.length, 3)
  const other = await handleAccessRequest({ body: valid, ip: "3.3.3.3", webhookUrl: WEBHOOK, fetchImpl: impl })
  assert.equal(other.status, 200)
})

test("returns 502 when Discord rejects the webhook", async () => {
  const { impl } = fakeFetch(500)
  const res = await handleAccessRequest({ body: valid, ip: "4.4.4.4", webhookUrl: WEBHOOK, fetchImpl: impl })
  assert.equal(res.status, 502)
})
