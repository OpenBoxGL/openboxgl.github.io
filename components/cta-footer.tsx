import Image from "next/image"
import { GameCodeButton } from "@/components/experience-layer"

const footerLinks = [
  ["Downloads", "/downloads/"],
  ["Docs", "/docs/"],
  ["Compare", "/compare/"],
  ["Showcase", "/showcase/"],
  ["Enterprise", "/enterprise/"],
  ["Changelog", "/changelog/"],
  ["Roadmap", "/roadmap/"],
  ["Privacy", "/policies/privacy/"],
  ["Security", "/policies/security/"],
]

export function CtaFooter() {
  return (
    <footer className="ob-footer">
      <div className="ob-shell">
        <div className="ob-footer-main" data-reveal>
          <div className="ob-footer-mark">
            <Image src="/openbox-icon.png" alt="OpenBox" width={220} height={220} />
          </div>
          <div className="ob-footer-copy">
            <p className="ob-index">You’ve collected enough launchers</p>
            <h2 className="ob-display">Time to enjoy<br/><em>your collection.</em></h2>
            <p>Free, open source, and ready for your little corner of gaming.</p>
            <div className="ob-footer-actions">
              <a href="/install/" className="ob-button ob-button-primary">
                Install on Linux
              </a>
              <a
                href="https://github.com/vindeckyy/OpenBoxGL"
                target="_blank"
                rel="noopener noreferrer"
                className="ob-button ob-button-quiet"
              >
                Inspect the source
              </a>
            </div>
          </div>
        </div>

        <div className="ob-footer-meta">
          <nav aria-label="Footer navigation">
            {footerLinks.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
          </nav>
          <div className="ob-footer-code">
            <span>There is always a code.</span>
            <GameCodeButton />
          </div>
        </div>

        <div className="ob-footer-bottom">
          <span>OpenBoxGL / AGPL-3.0</span>
          <span>Built for Linux, Steam Deck, and handheld PCs.</span>
        </div>
      </div>
    </footer>
  )
}
