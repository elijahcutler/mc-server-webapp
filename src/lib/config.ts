// Site configuration, read at build time. Values are passed to components as
// props, so nothing here is exposed to the browser unless a component renders it.
// The old NEXT_PUBLIC_* names are still accepted to ease migration.

function env(name: string): string | undefined {
  const value =
    import.meta.env[name] ??
    import.meta.env[`NEXT_PUBLIC_${name}`] ??
    process.env[name] ??
    process.env[`NEXT_PUBLIC_${name}`]
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined
}

export const config = {
  serverName: env("SERVER_NAME") ?? "MC Server",
  serverDescription:
    env("SERVER_DESCRIPTION") ?? "Join our modded Minecraft community and explore a world of endless possibilities.",
  serverIp: env("SERVER_IP"),
  gameVersion: env("GAME_VERSION"),
  modLoader: (env("MODLOADER") ?? "neoforge").toLowerCase(),
  modpackId: env("MODPACK_ID"),
  githubUrl: env("GITHUB_URL") ?? "https://github.com/elijahcutler/mc-server-webapp",
  mapUrl: env("MAP_URL"),
}

export const LOADER_NAMES: Record<string, string> = {
  neoforge: "NeoForge",
  forge: "Forge",
  fabric: "Fabric",
  quilt: "Quilt",
}
