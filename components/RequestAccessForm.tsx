import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RequestAccessFormProps {
  onClose: () => void
}

export default function RequestAccessForm({ onClose }: RequestAccessFormProps) {
  const [discordUsername, setDiscordUsername] = useState("")
  const [minecraftUsername, setMinecraftUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
      if (!webhookUrl) throw new Error("Discord webhook URL not configured")

      const message = {
        content: `**New Access Request**\nDiscord: ${discordUsername}\nMinecraft: ${minecraftUsername}`
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      })

      if (!response.ok) throw new Error('Failed to send webhook')
      
      onClose()
      setDiscordUsername("")
      setMinecraftUsername("")
    } catch (error) {
      console.error('Error sending access request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
        <div className="bg-card border border-border p-6 rounded-lg shadow-lg">
          <button 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <h3 className="text-lg font-semibold text-foreground">Request Server Access</h3>
          
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Discord Username
              </label>
              <input
                type="text"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                placeholder="username#0000"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Minecraft Username
              </label>
              <input
                type="text"
                value={minecraftUsername}
                onChange={(e) => setMinecraftUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                placeholder="Your Minecraft username"
                required
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 