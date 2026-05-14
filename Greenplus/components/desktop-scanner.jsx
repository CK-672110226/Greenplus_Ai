/* =========================================================
   DESKTOP — AI Scanner (Stage 1 detect → Stage 2 grade)
   Uses: Sidebar, Topbar
   Exports: Scanner
   ========================================================= */

const { Sidebar, Topbar } = window;

function Scanner() {
  return (
    <div className="ab scan wf">
      <Topbar active="AI Scanner" />
      <Sidebar active="AI Scanner" />

      <section className="stage">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="crumb">HOME / AI SCANNER / NEW SCAN</div>
            <h1 style={{ fontSize: 30 }}>Point camera at the item</h1>
          </div>
          <div className="row">
            <span className="chip">flash ▾</span>
            <span className="chip">camera 1 ▾</span>
            <button className="btn ghost">batch mode</button>
          </div>
        </div>

        <div className="viewfinder">
          <span className="vf-corner tl" />
          <span className="vf-corner tr" />
          <span className="vf-corner bl" />
          <span className="vf-corner br" />

          <div className="vf-status">
            <span className="chip" style={{ background: '#fff' }}>● live · 30fps</span>
            <span className="chip soft">stage 1 of 2 · detecting</span>
            <span className="chip" style={{ background: '#fff' }}>auto-focus ✓</span>
          </div>

          <div className="scanline" />

          <div className="object">
            <div className="bbox">
              <i /><b />
              <span className="label">PLASTIC BOTTLE · 98%</span>
            </div>
            <div className="bottle" />
          </div>

          <div style={{ position: 'absolute', left: 18, bottom: 60, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>
            ↕ 24cm · ⌀ 6.5cm · est. 0.82 kg
          </div>
          <div style={{ position: 'absolute', right: 18, bottom: 60, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>
            model: gp-vision-2.1 · 47ms
          </div>
        </div>

        <div className="actionrow">
          <button className="btn">↺ Retake Scan</button>
          <button className="btn ghost">Manual entry</button>
          <div className="spacer" />
          <span className="mono">basket: 3 items · est. ฿ 78</span>
          <button className="btn primary">✓ Confirm & Add to Basket</button>
        </div>

        <div className="ann" style={{ left: 280, top: 120 }}>
          <b>Stage 1</b> — object detection<br />bounding box + class + confidence
          <span className="arrow" />
        </div>
      </section>

      <aside className="right">
        <div className="panel-h">
          <h3>Live Analysis</h3>
          <span className="stage-pill">STAGE 2 / 2</span>
        </div>
        <div className="mono">contamination · material purity · weight</div>

        <div className="card" style={{ padding: 12, gap: 8, boxShadow: 'none' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="mini-label">Contamination level</span>
            <span className="mono">12% · low</span>
          </div>
          <div className="progress">
            <i style={{ width: '12%' }} />
            <div className="ticks"><span /><span /><span /></div>
          </div>
          <div className="row mono" style={{ justifyContent: 'space-between' }}>
            <span>clean</span><span>mixed</span><span>contam.</span>
          </div>

          <div style={{ marginTop: 6 }}>
            <div className="grade-row">
              <span className="g a">A</span>
              <span className="label">Clean PET, label removed</span>
              <span className="pct">×1.00</span>
            </div>
            <div className="grade-row">
              <span className="g b">B</span>
              <span className="label">Light residue / label on</span>
              <span className="pct">×0.75</span>
            </div>
            <div className="grade-row">
              <span className="g c">C</span>
              <span className="label">Mixed / wet / dirty</span>
              <span className="pct">×0.40</span>
            </div>
          </div>
        </div>

        <div className="calc">
          <div className="mini-label" style={{ color: 'var(--green-ink)', marginBottom: 6 }}>ESTIMATED VALUE</div>
          <div className="row"><span>Weight</span><span><var>0.82</var> kg</span></div>
          <div className="row"><span>Base price (PET)</span><span>฿ <var>24.0</var> /kg</span></div>
          <div className="row"><span>Grade multiplier</span><span><var>×1.00</var> (A)</span></div>
          <div className="row"><span>Distance bonus</span><span>+ <var>฿2.4</var></span></div>
          <div className="eq row">
            <span>= W × Base × Grade</span>
            <span className="total">฿ 22.10</span>
          </div>
          <div className="mono" style={{ marginTop: 4 }}>impact: +18 pts · CO₂ saved 0.31kg</div>
        </div>

        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <span className="chip soft">PET #1</span>
          <span className="chip">food-grade ✓</span>
          <span className="chip">cap: HDPE</span>
        </div>

        <div className="mono mut" style={{ marginTop: 'auto' }}>tap any field above to override AI estimate ↑</div>
      </aside>
    </div>
  );
}

Object.assign(window, { Scanner });
