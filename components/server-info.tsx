"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define types for the API responses
interface ModrinthVersion {
  id: string
  project_id: string
  name: string
  version_number: string
  date_published: string
  files: {
    url: string
    filename: string
    primary: boolean
  }[]
}

interface ModrinthProject {
  id: string
  title: string
  slug: string
  description: string
}

interface ModpackInfo {
  name: string
  version: string
  downloadUrl: string
  publishDate: string
}

export default function ServerInfo() {
  const serverIp = process.env.NEXT_PUBLIC_SERVER_IP || "mc.ip.address"
  const gameVersion = process.env.NEXT_PUBLIC_GAME_VERSION || "Game Version"

  const [modpackInfo, setModpackInfo] = useState<ModpackInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModpackInfo() {
      try {
        setLoading(true)
        setError(null)

        // Get the game version from the environment variable
        const mcVersion = gameVersion.split(" ")[1] || "1.20.1"

        // Fetch modpack versions
        const modpackId = "fabulously-optimized"
        const loaderType = "neoforge"
        const versionsResponse = await fetch(
          `https://api.modrinth.com/v2/project/${modpackId}/version?loaders=["${loaderType}"]&game_versions=["${mcVersion}"]`,
        )

        if (!versionsResponse.ok) {
          throw new Error(`Failed to fetch modpack versions: ${versionsResponse.status}`)
        }

        const versionsData = (await versionsResponse.json()) as ModrinthVersion[]

        if (versionsData.length === 0) {
          throw new Error(`No versions found for modpack ${modpackId}`)
        }

        // Get the first (latest) version
        const latestVersion = versionsData[0]

        // Fetch the project details to get the name
        const projectResponse = await fetch(`https://api.modrinth.com/v2/project/${modpackId}`)

        if (!projectResponse.ok) {
          throw new Error(`Failed to fetch project details: ${projectResponse.status}`)
        }

        const projectData = (await projectResponse.json()) as ModrinthProject

        // Find the primary download file
        const primaryFile = latestVersion.files.find((file) => file.primary) || latestVersion.files[0]

        // Format the date
        const publishDate = new Date(latestVersion.date_published).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })

        setModpackInfo({
          name: projectData.title,
          version: latestVersion.version_number,
          downloadUrl: primaryFile.url,
          publishDate,
        })
      } catch (err) {
        console.error("Error fetching modpack info:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch modpack info")

        // Use fallback data from environment variables
        setModpackInfo({
          name: process.env.NEXT_PUBLIC_MODPACK_NAME || "Custom Mod Pack",
          version: process.env.NEXT_PUBLIC_MODPACK_VERSION || "v2.5",
          downloadUrl: "#",
          publishDate: "Unknown",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchModpackInfo()
  }, [gameVersion])

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(serverIp)
      .then(() => {
        // Could add a toast notification here
        console.log("Server IP copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  return (
    <Card className="h-full bg-card shadow-xl border-primary/20 border" id="server-info">
      <CardHeader>
        <CardTitle className="text-2xl text-card-foreground">Server Information</CardTitle>
        <CardDescription className="text-muted-foreground">
          Everything you need to connect to our server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-card-foreground">Server Address</div>
          <div className="flex items-center gap-2">
            <code className="relative rounded bg-muted px-[0.5rem] py-[0.3rem] font-mono text-base flex-1 text-foreground">
              {serverIp}
            </code>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy server address</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-card-foreground">Game Version</div>
          <div className="text-base text-foreground">{gameVersion}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-card-foreground">Modpack</div>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading modpack information...</span>
            </div>
          ) : error ? (
            <div className="text-muted-foreground">
              <p>Error loading modpack info. Using fallback data.</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-base text-foreground">{`${modpackInfo?.name} ${modpackInfo?.version}`}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <a
                  href={`https://modrinth.com/project/fabulously-optimized`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-foreground underline hover:text-accent-foreground"
                >
                  {modpackInfo?.name}
                </a>
                <a
                  className="h-8 gap-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  href={modpackInfo?.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Modrinth Profile Download (.mrpack)
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-accent/20 p-4">
          <h4 className="font-medium mb-2 text-card-foreground">Getting Started</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
            <li>Download and install the modpack</li>
            <li>Launch Minecraft with the modpack profile</li>
            <li>Add the server to your multiplayer list</li>
            <li>Connect and start playing!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

