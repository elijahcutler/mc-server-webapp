import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="mt-6 pt-6 text-center text-sm text-muted-foreground">
          <p className="mt-2 flex items-center justify-center gap-1">
            made with <Heart className="h-3 w-3 text-green-500" /> by elijah
          </p>
        </div>
      </div>
    </footer>
  )
}

