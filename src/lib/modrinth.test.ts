import { test } from "node:test"
import assert from "node:assert/strict"
import { fetchModpack } from "./modrinth.ts"

const responses: Record<string, unknown> = {
  "/project/pack/version": [
    {
      id: "v1",
      version_number: "2.0.0",
      date_published: "2026-09-01T00:00:00Z",
      files: [
        { url: "https://cdn/extra.zip", filename: "extra.zip", primary: false },
        { url: "https://cdn/pack.mrpack", filename: "pack.mrpack", primary: true },
      ],
      dependencies: [
        { project_id: "b", dependency_type: "embedded" },
        { project_id: "a", dependency_type: "embedded" },
        { project_id: "a", dependency_type: "embedded" },
        { project_id: null, dependency_type: "embedded" },
      ],
    },
  ],
  "/project/pack": { id: "pack", slug: "pack", title: "My Pack" },
  "/projects": [
    { id: "b", slug: "zeta", title: "Zeta", description: "", categories: ["magic"], icon_url: null, downloads: 1, team: "t2", project_type: "mod" },
    { id: "a", slug: "alpha", title: "Alpha", description: "", categories: ["tech", "storage"], icon_url: null, downloads: 2, team: "t1", project_type: "shader" },
  ],
  "/teams": [
    [
      { team_id: "t1", role: "Member", user: { username: "helper" } },
      { team_id: "t1", role: "Owner", is_owner: true, user: { username: "alice" } },
    ],
    [{ team_id: "t2", role: "Owner", user: { username: "bob" } }],
  ],
}

function mockFetch() {
  const urls: string[] = []
  globalThis.fetch = (async (input: string) => {
    urls.push(input)
    const path = new URL(input).pathname.replace("/v2", "")
    if (!(path in responses)) return new Response("not found", { status: 404 })
    return Response.json(responses[path])
  }) as typeof fetch
  return urls
}

test("builds modpack data with bulk requests", async () => {
  const urls = mockFetch()
  const data = await fetchModpack("pack", { loader: "neoforge", gameVersion: "1.21.1" })

  assert.equal(data.name, "My Pack")
  assert.equal(data.version, "2.0.0")
  assert.equal(data.downloadUrl, "https://cdn/pack.mrpack")
  assert.deepEqual(
    data.mods.map((m) => [m.name, m.author, m.url]),
    [
      ["Alpha", "alice", "https://modrinth.com/shader/alpha"],
      ["Zeta", "bob", "https://modrinth.com/mod/zeta"],
    ],
  )
  // versions + project + projects + teams: no per-mod requests
  assert.equal(urls.length, 4)
  const projectsUrl = new URL(urls.find((u) => u.includes("/projects?"))!)
  assert.deepEqual(JSON.parse(projectsUrl.searchParams.get("ids")!), ["b", "a"])
  const versionsUrl = new URL(urls.find((u) => u.includes("/version?"))!)
  assert.equal(versionsUrl.searchParams.get("game_versions"), '["1.21.1"]')
})

test("omits the game version filter when none is configured", async () => {
  const urls = mockFetch()
  await fetchModpack("pack", { loader: "neoforge" })
  const versionsUrl = new URL(urls.find((u) => u.includes("/version?"))!)
  assert.equal(versionsUrl.searchParams.has("game_versions"), false)
})

test("throws a readable error when no versions match", async () => {
  mockFetch()
  const saved = responses["/project/pack/version"]
  responses["/project/pack/version"] = []
  try {
    await assert.rejects(
      fetchModpack("pack", { loader: "fabric", gameVersion: "1.20.1" }),
      /No fabric versions .* 1\.20\.1/,
    )
  } finally {
    responses["/project/pack/version"] = saved
  }
})
