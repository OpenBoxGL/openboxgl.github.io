import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "OpenBox — The local-first launcher for every game you own",
  description:
    "OpenBox unifies Steam, GOG, Heroic, Lutris, ROMs and arcade sets into one art-rich, controller-ready library. Open source. Local-first. Zero telemetry.",
  generator: "v0.app",
  keywords: [
    "OpenBox",
    "game launcher",
    "Linux gaming",
    "Steam Deck",
    "emulator frontend",
    "ROM manager",
    "Big Box",
    "local-first",
  ],
  openGraph: {
    title: "OpenBox — One library for every game you own",
    description:
      "Steam, GOG, Heroic, Lutris, ROMs and arcade — unified into one art-rich, controller-ready, local-first library.",
    type: "website",
  },
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0e16",
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
