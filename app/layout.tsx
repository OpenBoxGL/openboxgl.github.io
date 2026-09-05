import type React from "react"
import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://openboxgl.github.io"),
  title: "OpenBox | Every game. One box.",
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
    title: "OpenBox | Every game. One box.",
    description:
      "Steam, GOG, Heroic, Lutris, ROMs and arcade in one art-rich, controller-ready, local-first library.",
    type: "website",
    url: "https://openboxgl.github.io/",
    siteName: "OpenBox",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "OpenBox, one library for every game you own" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenBox | Every game. One box.",
    description:
      "Steam, GOG, Heroic, Lutris, ROMs and arcade in one art-rich, controller-ready, local-first library.",
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
    <html lang="en" className={`dark bg-background ${bricolage.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
