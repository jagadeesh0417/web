/** Decorative illustration, not a screenshot or representation of client results. */
export function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hero-orbit hero-orbit-one" />
      <div className="hero-orbit hero-orbit-two" />
      <div className="hero-laptop">
        <div className="hero-screen">
          <div className="hero-screen-bar"><span /><span /><span /></div>
          <div className="hero-dashboard">
            <div className="hero-sidebar"><i /><i /><i /><i /></div>
            <div className="hero-dashboard-content">
              <div className="hero-dashboard-heading"><b /><i /></div>
              <div className="hero-dashboard-tiles"><span /><span /><span /></div>
              <div className="hero-chart">
                <svg viewBox="0 0 340 100" preserveAspectRatio="none" focusable="false">
                  <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#F58216" stopOpacity=".4"/><stop offset="1" stopColor="#F58216" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 83 C35 78 45 63 75 68 S120 45 145 52 S185 27 215 35 S265 10 290 17 S320 5 340 8 L340 100 H0Z" fill="url(#chart-fill)" />
                  <path d="M0 83 C35 78 45 63 75 68 S120 45 145 52 S185 27 215 35 S265 10 290 17 S320 5 340 8" fill="none" stroke="#F4BD53" strokeWidth="3" />
                </svg>
              </div>
              <div className="hero-dashboard-bottom"><span /><span /><span /><span /><span /><span /><span /></div>
            </div>
          </div>
        </div>
        <div className="hero-laptop-base" />
      </div>
      <div className="hero-floating hero-floating-top"><span className="hero-floating-icon">↗</span><span><i /><i /></span></div>
      <div className="hero-floating hero-floating-bottom"><span className="hero-pulse" /><span><i /><i /></span></div>
    </div>
  );
}
