"use client"

import { useEffect, useState } from "react"
import { fetchModpack, type ModpackData } from "@/lib/modrinth"

export const modpackId = process.env.NEXT_PUBLIC_MODPACK_ID
export const modLoader = process.env.NEXT_PUBLIC_MODLOADER || "neoforge"
export const gameVersion = process.env.NEXT_PUBLIC_GAME_VERSION || undefined

// Shared across components so the modpack is only fetched once per page load.
let request: Promise<ModpackData> | null = null

type State =
  | { status: "missing" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: ModpackData }

export function useModpack(): State {
  const [state, setState] = useState<State>(modpackId ? { status: "loading" } : { status: "missing" })

  useEffect(() => {
    if (!modpackId) return
    let cancelled = false
    request ??= fetchModpack(modpackId, { loader: modLoader, gameVersion })
    request
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch((err: unknown) => {
        request = null
        if (!cancelled) setState({ status: "error", error: err instanceof Error ? err.message : String(err) })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
