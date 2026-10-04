import { useEffect, useMemo, useState } from "preact/hooks"
import { Loader2, Package, Search } from "lucide-preact"
import { fetchModpack, type ModData } from "@/lib/modrinth"
import { badgeVariants, cx, inputClass } from "@/lib/ui"

interface Props {
  /** Mods fetched at build time; null when the build couldn't reach Modrinth. */
  initialMods: ModData[] | null
  modpackId: string
  loader: string
  gameVersion?: string
}

export default function ModList({ initialMods, modpackId, loader, gameVersion }: Props) {
  const [mods, setMods] = useState<ModData[]>(initialMods ?? [])
  const [loading, setLoading] = useState(initialMods === null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Fall back to fetching in the browser if the build-time fetch failed.
  useEffect(() => {
    if (initialMods !== null) return
    fetchModpack(modpackId, { loader, gameVersion })
      .then((data) => setMods(data.mods))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [initialMods, modpackId, loader, gameVersion])

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(mods.flatMap((mod) => mod.categories))).sort()],
    [mods],
  )

  const query = searchTerm.trim().toLowerCase()
  const filteredMods = mods.filter((mod) => {
    const matchesSearch = mod.name.toLowerCase().includes(query) || mod.description.toLowerCase().includes(query)
    const matchesCategory = selectedCategory === "All" || mod.categories.includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <p class="text-sm text-muted-foreground">
        {loading
          ? "Loading mods from Modrinth..."
          : error
            ? ""
            : `Our server runs ${mods.length} carefully selected mods for the best experience`}
      </p>

      <div class="flex flex-col sm:flex-row gap-4 mt-4">
        <div class="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search mods..."
            aria-label="Search mods"
            class={cx(inputClass, "pl-8 pr-3")}
            value={searchTerm}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            disabled={loading}
          />
        </div>

        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              class={cx(
                badgeVariants({ variant: selectedCategory === category ? "default" : "outline" }),
                "cursor-pointer capitalize disabled:opacity-50",
              )}
              onClick={() => setSelectedCategory(category)}
              disabled={loading}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div class="mt-6">
        {loading ? (
          <div class="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p class="text-muted-foreground">Loading mods from Modrinth...</p>
          </div>
        ) : error ? (
          <div class="text-center py-12 space-y-4">
            <p class="text-muted-foreground">Error loading mods: {error}</p>
            <p class="text-muted-foreground">Please try again later.</p>
          </div>
        ) : (
          <>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMods.map((mod) => (
                <a
                  key={mod.id}
                  href={mod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block rounded-lg bg-accent/20 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] hover:bg-accent/30"
                >
                  <div class="p-4">
                    <div class="flex items-start gap-3">
                      {mod.imageUrl ? (
                        <img
                          src={mod.imageUrl}
                          alt=""
                          loading="lazy"
                          width={48}
                          height={48}
                          class="w-12 h-12 rounded-md object-cover bg-muted"
                        />
                      ) : (
                        <div class="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                      <div>
                        <h3 class="font-bold text-base text-card-foreground">{mod.name}</h3>
                        <p class="text-xs text-muted-foreground">by {mod.author}</p>
                      </div>
                    </div>

                    <p class="text-sm mt-2 line-clamp-2 text-foreground">{mod.description}</p>

                    {mod.categories[0] && (
                      <div class="flex justify-end items-center mt-2">
                        <span class={cx(badgeVariants(), "text-xs capitalize")}>{mod.categories[0]}</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {filteredMods.length === 0 && (
              <div class="text-center py-12">
                <p class="text-muted-foreground">No mods found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
