# Minecraft Server Webapp

A fast, lightweight website for showcasing a modded Minecraft server. Built with
[Astro](https://astro.build/), Tailwind CSS and a few small [Preact](https://preactjs.com/) islands.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- 🎮 **Live server status**: online/offline, player count and version, refreshed every 5 minutes
- 📝 **Server information**: copyable server address, game version and modpack download
- 🔧 **Mod list**: searchable, filterable list of the modpack's mods from the Modrinth API
- ✉️ **Request access**: players submit their Discord and Minecraft names to a Discord channel
- 🌙 **Dark/light mode**: follows the system setting and remembers your choice
- 🪶 **Light footprint**: a static site with about 16 KB of gzipped JavaScript; the only
  server-side code is a dependency-free Node script for the request form

## How it works

- `npm run build` renders a static site into `dist/`. The modpack and mod list are fetched from
  Modrinth **at build time** and baked into the HTML. If Modrinth is unreachable during a build,
  the mod list loads in the browser instead.
- Server status is fetched live in the browser from [mcsrvstat.us](https://mcsrvstat.us/).
- `server/index.mjs` handles `POST /api/request-access`, validates the input, rate limits
  per IP and forwards the request to a Discord webhook that is never exposed to visitors.
  It can also serve `dist/`, so a single small process can host everything.

## Getting Started

### Prerequisites

- Node.js 22.12 or later
- A Minecraft server (optional)

### Configuration

Copy `.env.example` to `.env` and fill it in:

| Variable | Used | Description |
|---|---|---|
| `SERVER_NAME` | build | Name shown in the navbar and page title |
| `SERVER_DESCRIPTION` | build | Page description and status fallback text |
| `SERVER_IP` | build | Address players connect to; also used for the status check |
| `GAME_VERSION` | build | Minecraft version used to pick the modpack release (optional) |
| `MODLOADER` | build | `neoforge` (default), `forge`, `fabric` or `quilt` |
| `MODPACK_ID` | build | Modrinth project ID or slug of the modpack |
| `GITHUB_URL` | build | Link for the GitHub buttons |
| `MAP_URL` | build | Optional web map link; enables the Map button |
| `DISCORD_WEBHOOK_URL` | runtime | Webhook that receives access requests. Only read by `server/index.mjs`. |

Build-time values are rendered into the page, so rebuild after changing them. The older
`NEXT_PUBLIC_*` names are still accepted.

### Development

```bash
git clone https://github.com/elijahcutler/mc-server-webapp.git
cd mc-server-webapp
npm install
npm run dev        # site on http://localhost:4321
npm run dev:api    # optional, in a second terminal: request form API on :8787
```

### Checks

```bash
npm run check   # Astro and TypeScript diagnostics
npm test        # unit tests for the API server and Modrinth client
npm run build
```

## Deployment

1. `npm ci && npm run build`
2. Run the API (and optionally the site) with Node:
   - **Single process:** `npm run serve` serves `dist/` and the API on port 8787.
   - **Behind Caddy (recommended):** Caddy serves `dist/` and proxies `/api/*` to Node.
     See [`deploy/Caddyfile`](deploy/Caddyfile) and the systemd unit
     [`deploy/mc-webapp.service`](deploy/mc-webapp.service).
3. Optional: enable [`deploy/mc-webapp-rebuild.timer`](deploy/mc-webapp-rebuild.timer) to rebuild every
   6 hours so the mod list follows modpack updates.

When the API runs behind a reverse proxy, set `TRUST_PROXY=1` so rate limiting uses the client
IP from `X-Forwarded-For`. Don't set it when Node is exposed directly.

## Project Structure

```
mc-server-webapp/
├── src/
│   ├── pages/         # index.astro: the page and build-time Modrinth fetch
│   ├── layouts/       # HTML shell, theme handling
│   ├── components/    # static Astro components
│   ├── islands/       # interactive Preact components
│   ├── lib/           # config, Modrinth client, UI class helpers
│   └── styles/        # Tailwind entry and theme tokens
├── server/            # dependency-free API + static file server
├── deploy/            # Caddy and systemd examples
└── public/            # static assets
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/) and [Preact](https://preactjs.com/)
- Icons from [Lucide](https://lucide.dev/) and [Simple Icons](https://simpleicons.org/)
- Mod data from the [Modrinth API](https://docs.modrinth.com/), server status from [mcsrvstat.us](https://mcsrvstat.us/)
