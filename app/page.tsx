import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/hero"
import { LibraryShowcase } from "@/components/library-showcase"
import { SourcesSection } from "@/components/sources-section"
import { SavesSection } from "@/components/saves-section"
import { MetadataSection } from "@/components/metadata-section"
import { EmulatorsSection } from "@/components/emulators-section"
import { BigBoxShowcase } from "@/components/bigbox-showcase"
import { DeckSection } from "@/components/deck-section"
import { FeatureBento } from "@/components/feature-bento"
import { AutomationSection } from "@/components/automation-section"
import { LocalFirst } from "@/components/local-first"
import { CtaFooter } from "@/components/cta-footer"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteNav />
      <Hero />
      <LibraryShowcase />
      <SourcesSection />
      <SavesSection />
      <MetadataSection />
      <EmulatorsSection />
      <BigBoxShowcase />
      <DeckSection />
      <FeatureBento />
      <AutomationSection />
      <LocalFirst />
      <CtaFooter />
    </main>
  )
}
