import { useEffect, useId, useState } from "react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RequestAccessFormProps {
  onClose: () => void
}

export default function RequestAccessForm({ onClose }: RequestAccessFormProps) {
  const [discordUsername, setDiscordUsername] = useState("")
  const [minecraftUsername, setMinecraftUsername] = useState("")
  const [website, setWebsite] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const id = useId()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Could not send your request. Please try again later.")
      }
      setSubmitted(true)
      setDiscordUsername("")
      setMinecraftUsername("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-card border border-border p-6 rounded-lg shadow-lg">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <h3 id={`${id}-title`} className="text-lg font-semibold text-foreground">Request Server Access</h3>

          {submitted ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-foreground">Request sent! We&apos;ll reach out on Discord soon.</p>
              <div className="flex justify-end">
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor={`${id}-discord`} className="text-sm font-medium text-foreground">
                  Discord Username
                </label>
                <input
                  id={`${id}-discord`}
                  type="text"
                  autoFocus
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                  placeholder="username"
                  maxLength={37}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`${id}-minecraft`} className="text-sm font-medium text-foreground">
                  Minecraft Username
                </label>
                <input
                  id={`${id}-minecraft`}
                  type="text"
                  value={minecraftUsername}
                  onChange={(e) => setMinecraftUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
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
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
