"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Server, Clock } from "lucide-react"

interface ServerStatusData {
  online: boolean
  players: {
    online: number
    max: number
  }
  version: string
  hostname?: string
  ip?: string
  motd?: {
    clean: string[]
  }
}

export default function ServerStatus() {
  const [serverData, setServerData] = useState<ServerStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        setLoading(true)
        // Use the environment variable for the server IP
        const serverIp = process.env.NEXT_PUBLIC_SERVER_IP || "your-server-ip"
        const response = await fetch(`https://api.mcsrvstat.us/2/${serverIp}`)
        const data = await response.json()
        setServerData(data)
      } catch (err) {
        setError("Failed to fetch server status")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchServerStatus()

    // Refresh every 5 minutes
    const intervalId = setInterval(fetchServerStatus, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  // Update the fallback data to use environment variables
  const fallbackData: ServerStatusData = {
    online: true,
    players: {
      online: 12,
      max: 50,
    },
    version: process.env.NEXT_PUBLIC_GAME_VERSION || "Forge 1.19.2",
    hostname: process.env.NEXT_PUBLIC_SERVER_IP || "mc.anchorlab.net",
    ip: process.env.NEXT_PUBLIC_SERVER_IP || "mc.anchorlab.net",
    motd: {
      clean: [process.env.NEXT_PUBLIC_SERVER_DESCRIPTION || "Welcome to AnchorLab MC - Modded Survival"],
    },
  }

  // Use fallback data if in development or if there's an error
  const displayData = serverData || fallbackData

  return (
    <Card className="h-full bg-card shadow-xl border-primary/20 border" id="server-status">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl text-card-foreground">Server Status</CardTitle>
          {loading ? (
            <Badge variant="outline" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking...
            </Badge>
          ) : (
            <Badge className={displayData.online ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {displayData.online ? "Online" : "Offline"}
            </Badge>
          )}
        </div>
        <CardDescription className="text-muted-foreground">
          {error ? error : displayData.motd?.clean?.[0] || "Welcome to our modded Minecraft server!"}
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
                <div className="text-2xl font-bold text-primary">{displayData.players.online}</div>
                <div className="text-sm text-muted-foreground">{`of ${displayData.players.max} max`}</div>
              </div>

              <div className="bg-accent/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="h-5 w-5 text-primary" />
                  <span className="font-medium text-card-foreground">Version</span>
                </div>
                <div className="text-2xl font-bold text-primary">{displayData.version}</div>
                <div className="text-sm text-muted-foreground">Forge Modded</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

