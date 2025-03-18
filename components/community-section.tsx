import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Server, Code, Heart } from "lucide-react"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CommunitySection() {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/elijahcutler/mc-webapp"

  return (
    <Card className="bg-card shadow-xl border-primary/20 border" id="community">
      <CardHeader>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-foreground">
            This Minecraft server is self-hosted for a small community of friends who share a passion for gaming 
            together. What started as a simple idea has evolved into a learning project about server administration,
            modding, and web development.
          </p>
          <br />
          <p className="text-foreground">
            This journey has involved learning about Linux server management, Java optimization, mod compatibility, and
            creating custom tools to enhance our gameplay experience. This website itself is part of that learning
            journey!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-accent/20 p-4 rounded-lg flex flex-col items-center text-center">
            <Server className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1 text-card-foreground">Self-Hosted</h3>
            <p className="text-sm text-muted-foreground">
              Running on dedicated hardware in a home lab environment
            </p>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg flex flex-col items-center text-center">
            <Code className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1 text-card-foreground">Learning Project</h3>
            <p className="text-sm text-muted-foreground">
              A continuous experiment in server management and web development
            </p>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg flex flex-col items-center text-center">
            <Heart className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1 text-card-foreground">Friend-Focused</h3>
            <p className="text-sm text-muted-foreground">Curated by peers who enjoy gaming together</p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <SiGithub className="h-4 w-4" color="currentColor" />
              <span>View on GitHub</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

