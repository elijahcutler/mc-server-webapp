import { test, before, after } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createAppServer } from "./index.mjs"

let server
let base
let dir

before(async () => {
  dir = await mkdtemp(join(tmpdir(), "mc-webapp-"))
  await mkdir(join(dir, "about"))
  await writeFile(join(dir, "index.html"), "<h1>home</h1>")
  await writeFile(join(dir, "about", "index.html"), "<h1>about</h1>")
  await writeFile(join(dir, "404.html"), "<h1>missing</h1>")
  await writeFile(join(dir, "app.js"), "console.log(1)")
  server = createAppServer({ staticDir: dir })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  base = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await rm(dir, { recursive: true, force: true })
})

test("serves index.html and nested directory indexes", async () => {
  const home = await fetch(`${base}/`)
  assert.equal(home.status, 200)
  assert.match(home.headers.get("content-type"), /text\/html/)
  assert.equal(await home.text(), "<h1>home</h1>")
  assert.equal(await (await fetch(`${base}/about`)).text(), "<h1>about</h1>")
})

test("serves assets with the right content type", async () => {
  const res = await fetch(`${base}/app.js`)
  assert.match(res.headers.get("content-type"), /javascript/)
})

test("returns the 404 page for unknown paths", async () => {
  const res = await fetch(`${base}/nope`)
  assert.equal(res.status, 404)
  assert.equal(await res.text(), "<h1>missing</h1>")
})

test("blocks path traversal", async () => {
  const res = await fetch(`${base}/..%2f..%2fetc%2fpasswd`)
  assert.equal(res.status, 404)
  assert.equal(await res.text(), "<h1>missing</h1>")
})

test("API rejects non-POST methods", async () => {
  const res = await fetch(`${base}/api/request-access`)
  assert.equal(res.status, 405)
})

test("API reports missing webhook configuration", async () => {
  const res = await fetch(`${base}/api/request-access`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ discordUsername: "steve", minecraftUsername: "Steve" }),
  })
  assert.equal(res.status, 503)
  assert.equal((await res.json()).ok, false)
})

test("health check responds", async () => {
  const res = await fetch(`${base}/healthz`)
  assert.equal(res.status, 200)
})
