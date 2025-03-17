import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

// Update metadata to use environment variables
export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SERVER_NAME || "Modded Minecraft Server"}`,
  description:
    process.env.NEXT_PUBLIC_SERVER_DESCRIPTION ||
    "Join our modded Minecraft community and explore a world of endless possibilities."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'