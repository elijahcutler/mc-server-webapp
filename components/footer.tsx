import { ServerIcon, Github, Heart } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const serverName = process.env.NEXT_PUBLIC_SERVER_NAME || "AnchorLab MC"

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center md:flex-row md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">{serverName}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="#server-status" className="text-foreground hover:text-primary transition-colors">
              Status
            </Link>
            <Link href="#server-info" className="text-foreground hover:text-primary transition-colors">
              Info
            </Link>
            <Link href="#mod-list" className="text-foreground hover:text-primary transition-colors">
              Mods
            </Link>
            <Link href="#community" className="text-foreground hover:text-primary transition-colors">
              Community
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/yourusername/minecraft-server"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500" /> by friends for friends
          </p>
        </div>
      </div>
    </footer>
  )
}

