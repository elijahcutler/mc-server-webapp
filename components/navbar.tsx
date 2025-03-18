"use client"

import { useState } from "react"
import Link from "next/link"
import { ServerIcon, Map, Menu, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import RequestAccessForm from "./RequestAccessForm"
import { SiGithub } from "@icons-pack/react-simple-icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false)
  const serverName = process.env.NEXT_PUBLIC_SERVER_NAME || "MC Server"
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/elijahcutler/mc-webapp"

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
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1" disabled>
                    <Map className="h-4 w-4" />
                    <span>Map</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Coming Soon!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsRequestFormOpen(true)}
            >
              <Users className="h-4 w-4" />
              <span>Request Access</span>
            </Button>
            <Link href={`${githubUrl}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SiGithub className="h-5 w-5" color="currentColor" />
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
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2" disabled>
                      <Map className="h-4 w-4" />
                      <span>Map</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Coming Soon!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                variant="default" 
                className="w-full justify-start gap-2"
                onClick={() => setIsRequestFormOpen(true)}
              >
                <Users className="h-4 w-4" />
                <span>Request Access</span>
              </Button>
              <Link
                href={`${githubUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md transition-colors text-foreground"
              >
                <SiGithub className="h-5 w-5" color="currentColor" />
                <span>GitHub</span>
              </Link>
            </div>
          </div>
        )}
      </div>
      {isRequestFormOpen && <RequestAccessForm onClose={() => setIsRequestFormOpen(false)} />}
    </header>
  )
}

