import Image from "next/image"

export function BigBoxShowcase() {
  return (
    <section id="bigbox" className="ob-bigbox" aria-labelledby="bigbox-title">
      <div className="ob-shell">
        <div className="ob-bigbox-heading" data-reveal>
          <div>
            <p className="ob-index">Small screen. Big Box.</p>
            <h2 id="bigbox-title" className="ob-display">Take the whole shelf.<br/><em>Leave the desk.</em></h2>
          </div>
          <p>The same collection, a different kind of evening. Big Box puts your games within thumb’s reach on a handheld, a TV, or the couch.</p>
        </div>
        <figure className="ob-handheld-scene" data-reveal>
          <div className="ob-handheld">
            <div className="ob-handheld-grip ob-grip-left" aria-hidden="true"><i className="ob-stick"/><i className="ob-dpad"/><span className="ob-speaker"/></div>
            <div className="ob-handheld-display">
              <Image src="/bigbox-mode.png" alt="OpenBox Big Box controller-first interface with Chrono Trigger selected" width={1920} height={1080} sizes="(max-width: 800px) 76vw, 840px" />
              <span aria-hidden="true">OPENBOX</span>
            </div>
            <div className="ob-handheld-grip ob-grip-right" aria-hidden="true"><div className="ob-face-buttons"><i>Y</i><i>X</i><i>B</i><i>A</i></div><i className="ob-stick"/><span className="ob-speaker"/></div>
          </div>
          <figcaption>Actual Big Box view · Illustrative handheld</figcaption>
        </figure>
        <div className="ob-handheld-details" data-reveal>
          <a href="/guides/big-box-and-handhelds/"><span>01</span><div><h3>Made for the controller</h3><p>CoverFlow, Stage view, and Steam Game Mode. Your library follows your lead.</p></div></a>
          <a href="/guides/big-box-and-handhelds/performance/"><span>02</span><div><h3>Tuned for each game</h3><p>Per-game gamescope, MangoHud, and TDP profiles for the way you play.</p></div></a>
          <a href="/guides/big-box-and-handhelds/"><span>03</span><div><h3>Room for player two</h3><p>Game Night keeps a couch queue, a spinning wheel, and the next round ready.</p></div></a>
        </div>
      </div>
    </section>
  )
}
