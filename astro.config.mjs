import { defineConfig } from "astro/config"
import preact from "@astrojs/preact"
import tailwindcss from "@tailwindcss/vite"

const apiOrigin = process.env.API_ORIGIN || "http://127.0.0.1:8787"

export default defineConfig({
  output: "static",
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // During `astro dev`, forward the request form to `npm run dev:api`.
      proxy: { "/api": apiOrigin },
    },
  },
})
