import { useEffect, useId, useState } from "preact/hooks"
import type { TargetedEvent } from "preact"
import { Loader2, X } from "lucide-preact"
import { buttonVariants, cx, inputClass } from "@/lib/ui"

const FALLBACK_ERROR = "Could not send your request. Please try again later."

export default function RequestAccessForm() {
  const [open, setOpen] = useState(false)
  const [discordUsername, setDiscordUsername] = useState("")
  const [minecraftUsername, setMinecraftUsername] = useState("")
  const [website, setWebsite] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const id = useId()

  useEffect(() => {
    const onOpen = () => {
      setSubmitted(false)
      setError(null)
      setOpen(true)
    }
    document.addEventListener("open-request-access", onOpen)
    return () => document.removeEventListener("open-request-access", onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  if (!open) return null
  const close = () => setOpen(false)

  const handleSubmit = async (e: TargetedEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordUsername, minecraftUsername, website }),
      })
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!response.ok || !result?.ok) throw new Error(result?.error || FALLBACK_ERROR)
      setSubmitted(true)
      setDiscordUsername("")
      setMinecraftUsername("")
    } catch (err) {
      setError(err instanceof Error ? err.message : FALLBACK_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="relative bg-card border border-border p-6 rounded-lg shadow-lg">
          <button
            type="button"
            class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer text-foreground"
            onClick={close}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">Close</span>
          </button>

          <h3 id={`${id}-title`} class="text-lg font-semibold text-foreground">
            Request Server Access
          </h3>

          {submitted ? (
            <div class="mt-4 space-y-4">
              <p class="text-sm text-foreground">Request sent! We&apos;ll reach out on Discord soon.</p>
              <div class="flex justify-end">
                <button type="button" class={buttonVariants()} onClick={close}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} class="mt-4 space-y-4">
              <div class="space-y-2">
                <label for={`${id}-discord`} class="text-sm font-medium text-foreground">
                  Discord Username
                </label>
                <input
                  id={`${id}-discord`}
                  type="text"
                  autoFocus
                  value={discordUsername}
                  onInput={(e) => setDiscordUsername(e.currentTarget.value)}
                  class={cx(inputClass, "px-3")}
                  placeholder="username"
                  maxLength={37}
                  required
                />
              </div>

              <div class="space-y-2">
                <label for={`${id}-minecraft`} class="text-sm font-medium text-foreground">
                  Minecraft Username
                </label>
                <input
                  id={`${id}-minecraft`}
                  type="text"
                  value={minecraftUsername}
                  onInput={(e) => setMinecraftUsername(e.currentTarget.value)}
                  class={cx(inputClass, "px-3")}
                  placeholder="Your Minecraft username"
                  pattern="[A-Za-z0-9_]{3,16}"
                  title="3-16 letters, numbers or underscores"
                  required
                />
              </div>

              {/* Honeypot: hidden from people, often filled in by bots. */}
              <input
                type="text"
                name="website"
                value={website}
                onInput={(e) => setWebsite(e.currentTarget.value)}
                class="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {error && (
                <p class="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <div class="flex justify-end gap-2 mt-6">
                <button type="button" class={buttonVariants({ variant: "outline" })} onClick={close}>
                  Cancel
                </button>
                <button type="submit" class={buttonVariants()} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
