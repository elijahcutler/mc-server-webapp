"use client"

import { useState } from "react"
import Link from "next/link"
import { ServerIcon, Map, Github, Menu, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const serverName = process.env.NEXT_PUBLIC_SERVER_NAME || "AnchorLab MC"

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Name */}
          <div className="flex items-center gap-2">
            <ServerIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">{serverName}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#server-status"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Status
            </Link>
            <Link
              href="#server-info"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Info
            </Link>
            <Link href="#mod-list" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Mods
            </Link>
            <Link
              href="#community"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Community
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Map className="h-4 w-4" />
              <span>Map</span>
            </Button>
            <Button variant="default" size="sm" className="gap-1">
              <Users className="h-4 w-4" />
              <span>Request Access</span>
            </Button>
            <Link href="https://github.com/yourusername/minecraft-server" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4 mb-4">
              <Link
                href="#server-status"
                className="px-2 py-1 text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Status
              </Link>
              <Link
                href="#server-info"
                className="px-2 py-1 text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Info
              </Link>
              <Link
                href="#mod-list"
                className="px-2 py-1 text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mods
              </Link>
              <Link
                href="#community"
                className="px-2 py-1 text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Community
              </Link>
            </nav>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Map className="h-4 w-4" />
                <span>Map</span>
              </Button>
              <Button variant="default" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                <span>Request Access</span>
              </Button>
              <Link
                href="https://github.com/yourusername/minecraft-server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md transition-colors text-foreground"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

