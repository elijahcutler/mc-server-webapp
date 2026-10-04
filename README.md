# Minecraft Server Webapp

A modern, responsive web application for managing and showcasing your Minecraft server. Built with Next.js, Tailwind CSS, and shadcn/ui components.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- 🎮 **Real-time Server Status** - Check if the server is online and see who's currently playing
- 📝 **Server Information** - Easy access to server IP, game version, and connection instructions
- 🔧 **Mod List Integration** - Browse and search through server mods with Modrinth API integration
- 🌙 **Dark/Light Mode** - Fully responsive theme support
- 🎨 **Modern UI** - Beautiful, accessible interface built with shadcn/ui components
- 🚀 **Fast Performance** - Built on Next.js for optimal loading speeds
- 📱 **Mobile Responsive** - Seamless experience across all devices

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Minecraft server (optional)

### Environment Variables

Copy `.env.example` to `.env.local` and fill it in:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SERVER_NAME` | no | Name shown in the navbar and page title |
| `NEXT_PUBLIC_SERVER_DESCRIPTION` | no | Page description and status fallback text |
| `NEXT_PUBLIC_SERVER_IP` | yes | Address players connect to; also used for the status check |
| `NEXT_PUBLIC_GAME_VERSION` | no | Minecraft version used to pick the modpack release |
| `NEXT_PUBLIC_MODLOADER` | no | `neoforge` (default), `forge`, `fabric` or `quilt` |
| `NEXT_PUBLIC_MODPACK_ID` | no | Modrinth project ID or slug of the modpack |
| `NEXT_PUBLIC_GITHUB_URL` | no | Link for the GitHub buttons |
| `DISCORD_WEBHOOK_URL` | for access requests | **Server-only.** Discord webhook that receives access requests. Never prefix it with `NEXT_PUBLIC_`. |

`NEXT_PUBLIC_*` values are embedded at build time, so rebuild after changing them.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/elijahcutler/mc-server-webapp.git
   cd mc-server-webapp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server (and, to test the request form, the API in a second terminal):
   ```bash
   npm run dev
   npm run dev:api
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Checks

```bash
npm run typecheck
npm test
```

## Deployment

`npm run build` produces a fully static site in `out/`. The only server-side piece is the
access request API in `server/index.mjs`, a dependency-free Node script.

- **Single process:** `npm run serve` serves `out/` and the API on port 8787 (about 65 MB of memory).
- **Behind Caddy (recommended):** Caddy serves `out/` and proxies `/api/*` to the Node script.
  See `deploy/Caddyfile` and the systemd unit in `deploy/mc-webapp.service`.

## Project Structure

```
mc-server-webapp/
├── app/               # Next.js app directory (page + /api/request-access)
├── components/        # React components
│   └── ui/            # shadcn/ui components
├── hooks/             # Shared React hooks
├── lib/               # Modrinth client and utilities
└── server/            # Framework-agnostic access request handler
```

## Features in Detail

### Server Status
- Real-time server status monitoring
- Current player count
- Server version information

### Server Information
- Easy-to-copy server IP address
- Detailed connection instructions
- Game version compatibility info

### Mod List
- Integration with Modrinth API
- Search and filter functionality
- Mod categories and descriptions
- Links to each project on Modrinth

### Community Section
- Server description and rules
- Community links and resources
- Request access functionality

## Customization

### Theme
The application uses Tailwind CSS for styling. You can customize the theme by modifying:
- `tailwind.config.js` for theme variables
- `app/globals.css` for global styles

### Components
UI components are built with shadcn/ui, which can be customized in the `components/ui` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Mod integration with [Modrinth API](https://docs.modrinth.com/)