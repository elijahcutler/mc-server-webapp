import { useEffect, useState } from "preact/hooks"
import { Clock, Loader2, Server, Users } from "lucide-preact"
import { badgeVariants, card, cx } from "@/lib/ui"

interface ServerStatusData {
  online: boolean
  players?: { online: number; max: number }
  version?: string
  motd?: { clean: string[] }
}

interface Props {
  serverIp?: string
  description: string
  loaderName: string
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

export default function ServerStatus({ serverIp, description, loaderName }: Props) {
  const [serverData, setServerData] = useState<ServerStatusData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(Boolean(serverIp))
  const [error, setError] = useState<string | null>(serverIp ? null : "Server address not configured")

  useEffect(() => {
    if (!serverIp) return

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

  const online = Boolean(serverData?.online)
  const motd = online ? serverData?.motd?.clean?.join(" ").trim() : ""

  return (
    <div class={cx(card.root, "h-full")}>
      <div class="flex flex-col space-y-1.5 px-6 pt-6 pb-2">
        <div class="flex justify-between items-center">
          <h2 class={card.title}>Server Status</h2>
          {loading ? (
            <span class={cx(badgeVariants({ variant: "outline" }), "gap-1")}>
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Checking...
            </span>
          ) : !serverData ? (
            <span class={badgeVariants({ variant: "outline" })}>Unknown</span>
          ) : online ? (
            <span class={badgeVariants({ variant: "online" })}>Online</span>
          ) : (
            <span class={badgeVariants({ variant: "offline" })}>Offline</span>
          )}
        </div>
        <p class={card.description}>{error || motd || description}</p>
      </div>
      <div class={card.content}>
        {loading ? (
          <div class="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading server status" />
          </div>
        ) : (
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-accent/30 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span class="font-medium text-card-foreground">Players</span>
                </div>
                <div class="text-2xl font-bold text-primary">{online ? (serverData?.players?.online ?? 0) : "—"}</div>
                <div class="text-sm text-muted-foreground">
                  {online ? `of ${serverData?.players?.max ?? 0} max` : "Unavailable"}
                </div>
              </div>

              <div class="bg-accent/30 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-1">
                  <Server className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span class="font-medium text-card-foreground">Version</span>
                </div>
                <div class="text-2xl font-bold text-primary">{online ? (serverData?.version ?? "Unknown") : "—"}</div>
                <div class="text-sm text-muted-foreground">{loaderName} Modded</div>
              </div>
            </div>

            {lastUpdated && (
              <div class="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span class="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
