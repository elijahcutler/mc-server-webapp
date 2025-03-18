"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"

// Define types for the API responses
interface ModrinthVersion {
  id: string
  project_id: string
  name: string
  version_number: string
  dependencies: {
    version_id: string | null
    project_id: string | null
    file_name: string | null
    dependency_type: string
  }[]
}

interface ModrinthProject {
  id: string
  title: string
  description: string
  categories: string[]
  icon_url: string
  downloads: number
  team: string
  slug: string
}

interface ModData {
  id: string
  name: string
  category: string
  description: string
  author: string
  downloads: number
  imageUrl: string
  slug: string
}

export default function ModList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [mods, setMods] = useState<ModData[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const modpackId = process.env.NEXT_PUBLIC_MODPACK_ID

  useEffect(() => {
    async function fetchModData() {
      if (!modpackId) {
        setLoading(false)
        setError("No modpack ID provided")
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Step 1: Get the game version from the server status (using environment variable for now)
        const gameVersion = process.env.NEXT_PUBLIC_GAME_VERSION || ""

        // Step 2: Fetch modpack versions
        const loaderType = "neoforge"
        const versionsResponse = await fetch(
          `https://api.modrinth.com/v2/project/${modpackId}/version?loaders=["${loaderType}"]&game_versions=["${gameVersion}"]`,
        )

        if (!versionsResponse.ok) {
          throw new Error(`Failed to fetch modpack versions: ${versionsResponse.status}`)
        }

        const versionsData = (await versionsResponse.json()) as ModrinthVersion[]

        if (versionsData.length === 0) {
          throw new Error(
            `No versions found for modpack ${modpackId} with loader ${loaderType} and game version ${gameVersion}`,
          )
        }

        // Step 3: Get the first version and extract project IDs from dependencies
        const firstVersion = versionsData[0]
        const projectIds = firstVersion.dependencies
          .filter((dep) => dep.project_id)
          .map((dep) => dep.project_id as string)

        // Step 4: Fetch details for each project
        const projectPromises = projectIds.map(async (projectId) => {
          const projectResponse = await fetch(`https://api.modrinth.com/v2/project/${projectId}`)
          if (!projectResponse.ok) {
            console.warn(`Failed to fetch project ${projectId}: ${projectResponse.status}`)
            return null
          }
          return (await projectResponse.json()) as ModrinthProject
        })

        const projectsData = (await Promise.all(projectPromises)).filter(Boolean) as ModrinthProject[]

        // Step 5: Transform the data into our ModData format
        const modData: ModData[] = projectsData.map((project) => ({
          id: project.id,
          name: project.title,
          category: project.categories[0] || "Utility",
          description: project.description,
          author: project.team || "Unknown",
          downloads: project.downloads,
          imageUrl: project.icon_url,
          slug: project.slug,
        }))

        // Step 6: Extract unique categories
        const uniqueCategories = Array.from(new Set(projectsData.flatMap((project) => project.categories))).sort()

        setMods(modData)
        setCategories(["All", ...uniqueCategories])
      } catch (err) {
        console.error("Error fetching mod data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch mod data")
        setMods([])
        setCategories(["All"])
      } finally {
        setLoading(false)
      }
    }

    fetchModData()
  }, [])

  // Filter mods based on search term and category
  const filteredMods = mods.filter((mod) => {
    const matchesSearch =
      mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || mod.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <Card className="bg-card shadow-xl border-primary/20 border" id="mod-list">
      <CardHeader>
        <CardTitle className="text-2xl text-card-foreground">Mod List</CardTitle>
        <CardDescription className="text-muted-foreground">
          {!modpackId
            ? ""
            : loading
            ? "Loading mods from Modrinth API..."
            : `Our server runs ${mods.length} carefully selected mods for the best experience`}
        </CardDescription>

        {modpackId && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search mods..."
                className="pl-8 text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer ${loading ? "opacity-50" : ""}`}
                  onClick={() => !loading && setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!modpackId ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Modpack ID not provided.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading mods from Modrinth API...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">Error loading mods: {error}</p>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMods.map((mod) => (
                <a
                  key={mod.id}
                  href={`https://modrinth.com/mod/${mod.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card bg-accent/20 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-accent/30"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={mod.imageUrl}
                        alt={mod.name}
                        className="w-12 h-12 rounded-md object-cover bg-muted"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = ""
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-base text-card-foreground">{mod.name}</h3>
                        <p className="text-xs text-muted-foreground">by {mod.author}</p>
                      </div>
                    </div>

                    <p className="text-sm mt-2 line-clamp-2 text-foreground">{mod.description}</p>

                    <div className="flex justify-end items-center mt-2">
                      <Badge className="bg-primary text-primary-foreground text-xs">{mod.category}</Badge>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {filteredMods.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No mods found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

