"use client";

import styles from "./hero-visual.module.css";

/** Pure CSS cinematic composition -- laptop, smartphone and floating cards. */
export function HeroVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.glow} />
      <div className={`${styles.orbit} ${styles.orbit1}`} />
      <div className={`${styles.orbit} ${styles.orbit2}`} />

      <div className={styles.laptop}>
        <div className={styles.laptopScreen}>
          <div className={styles.screenBar}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.dashboard}>
            <div className={styles.sidebar}>
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className={styles.main}>
              <div className={styles.heading}>
                <b />
                <i />
              </div>
              <div className={styles.tiles}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.chart}>
                <svg viewBox="0 0 340 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#F58216" stopOpacity=".35" />
                      <stop offset="1" stopColor="#F58216" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 83 C35 78 45 63 75 68 S120 45 145 52 S185 27 215 35 S265 10 290 17 S320 5 340 8 L340 100 H0Z"
                    fill="url(#chart-fill)"
                  />
                  <path
                    d="M0 83 C35 78 45 63 75 68 S120 45 145 52 S185 27 215 35 S265 10 290 17 S320 5 340 8"
                    fill="none"
                    stroke="#F4BD53"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className={styles.bottom}>
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.laptopBase} />
      </div>

      <div className={styles.phone}>
        <div className={styles.phoneBar} />
        <div className={`${styles.bubble} ${styles.bubbleLeft}`} />
        <div className={`${styles.bubble} ${styles.bubbleRight}`} />
        <div className={`${styles.bubble} ${styles.bubbleLeft}`} />
      </div>

      <div className={`${styles.floating} ${styles.floatingTop}`}>
        <span className={styles.icon}>&#8599;</span>
        <span className={styles.lines}>
          <i />
          <i />
        </span>
      </div>
      <div className={`${styles.floating} ${styles.floatingBottom}`}>
        <span className={styles.pulse} />
        <span className={styles.lines}>
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
