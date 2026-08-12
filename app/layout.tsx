import type React from "react"
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
  metadataBase: new URL("https://openboxgl.github.io"),
  title: "OpenBox — The local-first launcher for every game you own",
  description:
    "OpenBox unifies Steam, GOG, Heroic, Lutris, ROMs and arcade sets into one art-rich, controller-ready library. Open source. Local-first. Zero telemetry.",
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
    url: "https://openboxgl.github.io/",
    siteName: "OpenBox",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "OpenBox — one library for every game you own" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenBox — One library for every game you own",
    description:
      "Steam, GOG, Heroic, Lutris, ROMs and arcade — unified into one art-rich, controller-ready, local-first library.",
    images: ["/og-default.png"],
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
