"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { gameVersion, useModpack } from "@/hooks/use-modpack"

export default function ServerInfo() {
  const serverIp = process.env.NEXT_PUBLIC_SERVER_IP || "mc.ip.address"
  const modpack = useModpack()
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle")

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(serverIp)
      .then(() => setCopyState("copied"))
      .catch(() => setCopyState("failed"))
      .finally(() => setTimeout(() => setCopyState("idle"), 2000))
  }

  return (
    <Card className="h-full bg-card shadow-xl border-primary/20 border">
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
              {copyState === "copied" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy server address</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground h-4" aria-live="polite">
            {copyState === "copied" ? "Copied!" : copyState === "failed" ? "Couldn't copy, select the address instead." : ""}
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-card-foreground">Game Version</div>
          <div className="text-base text-foreground">{gameVersion ?? "Not specified"}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-card-foreground">Modpack</div>
          {modpack.status === "missing" ? (
            <div className="text-muted-foreground">
              <p>Modpack ID not provided.</p>
            </div>
          ) : modpack.status === "loading" ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading modpack information...</span>
            </div>
          ) : modpack.status === "error" ? (
            <div className="text-muted-foreground">
              <p>Error loading modpack info: {modpack.error}</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://modrinth.com/modpack/${modpack.data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-foreground underline hover:text-primary"
              >
                {modpack.data.name}
              </a>
              <span className="text-sm text-muted-foreground">v{modpack.data.version}</span>
              {modpack.data.downloadUrl && (
                <Button asChild variant="outline" size="sm" className="h-8 gap-1">
                  <a href={modpack.data.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Modrinth Profile Download (.mrpack)
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-accent/20 p-4">
          <h4 className="font-medium mb-2 text-card-foreground">Getting Started</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
            <li>{modpack.status !== "missing" ? "Download and install the modpack" : "Install the required mods (TBD)"}</li>
            <li>Launch Minecraft with the {modpack.status !== "missing" ? "modpack profile" : "correct profile"}</li>
            <li>Add the server to your multiplayer list</li>
            <li>Connect and start playing!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
