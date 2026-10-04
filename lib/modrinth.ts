const API = "https://api.modrinth.com/v2"

export interface ModrinthVersion {
  id: string
  version_number: string
  date_published: string
  files: { url: string; filename: string; primary: boolean }[]
  dependencies: { project_id: string | null; dependency_type: string }[]
}

export interface ModrinthProject {
  id: string
  slug: string
  title: string
  description: string
  categories: string[]
  icon_url: string | null
  downloads: number
  team: string
  project_type: string
}

interface ModrinthTeamMember {
  team_id: string
  role: string
  is_owner?: boolean
  user: { username: string }
}

export interface ModData {
  id: string
  name: string
  categories: string[]
  description: string
  author: string
  downloads: number
  imageUrl: string | null
  url: string
}

export interface ModpackData {
  name: string
  slug: string
  version: string
  downloadUrl: string | undefined
  publishDate: string
  mods: ModData[]
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Modrinth request failed (${response.status})`)
  return (await response.json()) as T
}

const idList = (ids: string[]) => encodeURIComponent(JSON.stringify(ids))

export async function fetchModpack(
  modpackId: string,
  { loader, gameVersion }: { loader: string; gameVersion?: string },
): Promise<ModpackData> {
  const params = new URLSearchParams({ loaders: JSON.stringify([loader]) })
  if (gameVersion) params.set("game_versions", JSON.stringify([gameVersion]))

  const [versions, project] = await Promise.all([
    getJson<ModrinthVersion[]>(`${API}/project/${encodeURIComponent(modpackId)}/version?${params}`),
    getJson<ModrinthProject>(`${API}/project/${encodeURIComponent(modpackId)}`),
  ])

  const latest = versions[0]
  if (!latest) {
    throw new Error(`No ${loader} versions of this modpack${gameVersion ? ` for ${gameVersion}` : ""}`)
  }

  const projectIds = [
    ...new Set(latest.dependencies.map((dep) => dep.project_id).filter((id): id is string => !!id)),
  ]
  const projects = projectIds.length
    ? await getJson<ModrinthProject[]>(`${API}/projects?ids=${idList(projectIds)}`)
    : []

  const teamIds = [...new Set(projects.map((p) => p.team))]
  const teams = teamIds.length
    ? await getJson<ModrinthTeamMember[][]>(`${API}/teams?ids=${idList(teamIds)}`).catch(() => [])
    : []
  const authorByTeam = new Map<string, string>()
  for (const members of teams) {
    const owner = members.find((m) => m.is_owner || m.role === "Owner") ?? members[0]
    if (owner) authorByTeam.set(owner.team_id, owner.user.username)
  }

  const mods = projects
    .map((p) => ({
      id: p.id,
      name: p.title,
      categories: p.categories,
      description: p.description,
      author: authorByTeam.get(p.team) ?? "Unknown",
      downloads: p.downloads,
      imageUrl: p.icon_url,
      url: `https://modrinth.com/${p.project_type}/${p.slug}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const primaryFile = latest.files.find((file) => file.primary) ?? latest.files[0]

  return {
    name: project.title,
    slug: project.slug,
    version: latest.version_number,
    downloadUrl: primaryFile?.url,
    publishDate: latest.date_published,
    mods,
  }
}
