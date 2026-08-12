import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/hero"
import { LibraryShowcase } from "@/components/library-showcase"
import { SourcesSection } from "@/components/sources-section"
import { BigBoxShowcase } from "@/components/bigbox-showcase"
import { FeatureBento } from "@/components/feature-bento"
import { LocalFirst } from "@/components/local-first"
import { CtaFooter } from "@/components/cta-footer"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteNav />
      <Hero />
      <LibraryShowcase />
      <SourcesSection />
      <BigBoxShowcase />
      <FeatureBento />
      <LocalFirst />
      <CtaFooter />
    </main>
  )
}
