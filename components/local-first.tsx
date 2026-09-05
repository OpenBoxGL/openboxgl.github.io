const promises = [
  ["00", "No account", "Open the app and use your own library."],
  ["01", "No telemetry", "OpenBox does not send analytics about you or your games."],
  ["10", "No cloud dependency", "The library, saves, and metadata remain on the device."],
  ["11", "Open source", "The AGPL-3.0 code is available to inspect and change."],
]

export function LocalFirst() {
  return (
    <section id="local" className="ob-local" aria-labelledby="local-title">
      <div className="ob-shell ob-local-layout">
        <div className="ob-local-manifesto" data-reveal>
          <p className="ob-index">Yours means yours</p>
          <h2 id="local-title" className="ob-display">
            The internet<br/>
            <em>is optional.</em>
          </h2>
          <p>
            OpenBox works from files on your machine. The web interface, native window, Big Box mode, and local API all
            read the same process-safe library.
          </p>
          <div className="ob-local-route" aria-label="OpenBox local data path">
            <span>Your files</span>
            <b aria-hidden="true">/</b>
            <span>OpenBox</span>
            <b aria-hidden="true">/</b>
            <span>Your game</span>
          </div>
          <div className="ob-section-links">
            <a href="/interfaces-and-data/">See where the data lives</a>
            <a href="/policies/privacy/">Read the privacy policy</a>
          </div>
        </div>

        <div className="ob-promise-list" data-reveal>
          {promises.map(([number, title, body]) => (
            <article key={number}>
              <span aria-hidden="true">✓</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
