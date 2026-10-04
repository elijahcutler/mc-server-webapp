"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Package, Search, Loader2 } from "lucide-react"
import { useModpack } from "@/hooks/use-modpack"

export default function ModList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const modpack = useModpack()
  const mods = modpack.status === "ready" ? modpack.data.mods : []
  const loading = modpack.status === "loading"

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(mods.flatMap((mod) => mod.categories))).sort()],
    [mods],
  )

  const query = searchTerm.trim().toLowerCase()
  const filteredMods = mods.filter((mod) => {
    const matchesSearch =
      mod.name.toLowerCase().includes(query) || mod.description.toLowerCase().includes(query)
    const matchesCategory = selectedCategory === "All" || mod.categories.includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <Card className="bg-card shadow-xl border-primary/20 border">
      <CardHeader>
        <CardTitle className="text-2xl text-card-foreground">Mod List</CardTitle>
        <CardDescription className="text-muted-foreground">
          {modpack.status === "ready"
            ? `Our server runs ${mods.length} carefully selected mods for the best experience`
            : loading
              ? "Loading mods from Modrinth..."
              : ""}
        </CardDescription>

        {modpack.status !== "missing" && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search mods..."
                aria-label="Search mods"
                className="pl-8 text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  className={`${badgeVariants({ variant: selectedCategory === category ? "default" : "outline" })} cursor-pointer capitalize disabled:opacity-50`}
                  onClick={() => setSelectedCategory(category)}
                  disabled={loading}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {modpack.status === "missing" ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Modpack ID not provided.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading mods from Modrinth...</p>
          </div>
        ) : modpack.status === "error" ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">Error loading mods: {modpack.error}</p>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMods.map((mod) => (
                <a
                  key={mod.id}
                  href={mod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg bg-accent/20 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-accent/30"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {mod.imageUrl ? (
                        <img
                          src={mod.imageUrl}
                          alt=""
                          loading="lazy"
                          className="w-12 h-12 rounded-md object-cover bg-muted"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-base text-card-foreground">{mod.name}</h3>
                        <p className="text-xs text-muted-foreground">by {mod.author}</p>
                      </div>
                    </div>

                    <p className="text-sm mt-2 line-clamp-2 text-foreground">{mod.description}</p>

                    {mod.categories[0] && (
                      <div className="flex justify-end items-center mt-2">
                        <Badge className="bg-primary text-primary-foreground text-xs capitalize">
                          {mod.categories[0]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {filteredMods.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No mods found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
