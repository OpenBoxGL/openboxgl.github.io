import { SiteNav } from "@/components/site-nav"
import { ExperienceLayer } from "@/components/experience-layer"
import { Hero } from "@/components/hero"
import { LibraryShowcase } from "@/components/library-showcase"
import { SourcesSection } from "@/components/sources-section"
import { BigBoxShowcase } from "@/components/bigbox-showcase"
import { SystemsSection } from "@/components/systems-section"
import { LocalFirst } from "@/components/local-first"
import { CtaFooter } from "@/components/cta-footer"

export default function Page() {
  return (
    <main id="main-content" className="ob-page">
      <ExperienceLayer />
      <SiteNav />
      <Hero />
      <LibraryShowcase />
      <SourcesSection />
      <BigBoxShowcase />
      <SystemsSection />
      <LocalFirst />
      <CtaFooter />
    </main>
  )
}
