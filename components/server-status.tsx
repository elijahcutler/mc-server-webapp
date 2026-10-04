"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Server, Clock } from "lucide-react"
import { modLoader } from "@/hooks/use-modpack"

interface ServerStatusData {
  online: boolean
  players?: {
    online: number
    max: number
  }
  version?: string
  motd?: {
    clean: string[]
  }
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000
const LOADER_NAMES: Record<string, string> = {
  neoforge: "NeoForge",
  forge: "Forge",
  fabric: "Fabric",
  quilt: "Quilt",
}

export default function ServerStatus() {
  const [serverData, setServerData] = useState<ServerStatusData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const serverIp = process.env.NEXT_PUBLIC_SERVER_IP
  const description = process.env.NEXT_PUBLIC_SERVER_DESCRIPTION || "Welcome to our modded Minecraft server!"

  useEffect(() => {
    if (!serverIp) {
      setError("Server address not configured")
      setLoading(false)
      return
    }

    const fetchServerStatus = async () => {
      try {
        const response = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(serverIp)}`)
        if (!response.ok) throw new Error(`Status API responded with ${response.status}`)
        setServerData((await response.json()) as ServerStatusData)
        setError(null)
      } catch (err) {
        console.error(err)
        setServerData(null)
        setError("Couldn't reach the status service")
      } finally {
        setLastUpdated(new Date())
        setLoading(false)
      }
    }

    fetchServerStatus()
    const intervalId = setInterval(fetchServerStatus, REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [serverIp])

  const statusBadge = loading ? (
    <Badge variant="outline" className="gap-1">
      <Loader2 className="h-3 w-3 animate-spin" />
      Checking...
    </Badge>
  ) : !serverData ? (
    <Badge variant="outline">Unknown</Badge>
  ) : serverData.online ? (
    <Badge className="bg-green-500 text-white">Online</Badge>
  ) : (
    <Badge className="bg-red-500 text-white">Offline</Badge>
  )

  return (
    <Card className="h-full bg-card shadow-xl border-primary/20 border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl text-card-foreground">Server Status</CardTitle>
          {statusBadge}
        </div>
        <CardDescription className="text-muted-foreground">
          {error || (serverData?.online ? serverData.motd?.clean?.join(" ").trim() : "") || description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium text-card-foreground">Players</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {serverData?.online ? (serverData.players?.online ?? 0) : "—"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {serverData?.online ? `of ${serverData.players?.max ?? 0} max` : "Unavailable"}
                </div>
              </div>

              <div className="bg-accent/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="h-5 w-5 text-primary" />
                  <span className="font-medium text-card-foreground">Version</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {serverData?.online ? (serverData.version ?? "Unknown") : "—"}
                </div>
                <div className="text-sm text-muted-foreground">{LOADER_NAMES[modLoader] ?? modLoader} Modded</div>
              </div>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
