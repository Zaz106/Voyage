'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './PageLoader.module.css';

export default function PageLoader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const icon = iconRef.current;
    if (!overlay || !icon) return;

    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        overlay.style.display = 'none';
        (window as Window & { __loaderComplete?: boolean }).__loaderComplete = true;
      },
    });

    // Phase 1: paint the icon — trail then sun in one smooth sweep
    tl.to(icon, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1.5,
      ease: 'power1.inOut',
    });

    // Phase 2: arc wipe with cloudy/feathered edges.
    // A radial ellipse grows from just below the bottom-centre of the screen.
    // The corners clear first, forming a half-arc that sweeps upward.
    // The wide spread between transparent→white stops creates the soft cloudy edge.
    const state = { p: 0, fired: false };
    tl.to(state, {
      p: 1,
      duration: 0.95,
      ease: 'power2.inOut',
      delay: 0.1,
      onUpdate() {
        const s = state.p * 285;
        const mask = `radial-gradient(ellipse ${s}% ${s * 0.8}% at 50% 115%, transparent 58%, rgba(255,255,255,0.4) 72%, white 88%)`;
        overlay.style.maskImage = mask;
        overlay.style.webkitMaskImage = mask;
        // Fire hero entrance at 50% through the wipe so content emerges
        // from beneath the dissolving overlay — seamless, not sequential.
        if (!state.fired && state.p >= 0.75) {
          state.fired = true;
          window.dispatchEvent(new CustomEvent('loaderComplete'));
        }
      },
    });

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <svg
        ref={iconRef}
        viewBox="0 400 1050 1000"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.icon}
        style={{
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          clipPath: 'inset(100% 0 0 0)',
        } as React.CSSProperties}
      >
        <g transform="matrix(2.456152,0,0,2.470511,-24816.993185,-390.925398)">
          <g transform="matrix(1.115154,0,0,1.115154,-2065.810357,227.947144)">
            <g transform="matrix(1,0,0,1,-9.113825,0)">
              <g transform="matrix(1,0,0,1,647.973304,-273.314426)">
                <g>
                  {/* Trail — the large sweeping comet-tail path */}
                  <g transform="matrix(0.088749,0,0,0.088749,8741.891444,265.991553)">
                    <path
                      d="M19480.727,4519.198C19103.865,4216.133 19039.774,3975.856 19467.831,3757.54C19956.318,3508.405 19316.995,3197.98 19340.262,2934.848C19361.953,2689.549 19779.358,2431.692 19663.888,1924.969L19400.028,1924.969C19399.656,2444.682 18965.817,2608.274 18890,2842.569C18808.672,3093.896 19359.669,3527.405 18831,3673C18056.053,3886.42 18024.496,4213.599 17931,4521.675L19480.727,4519.198Z"
                      fill="rgb(35,31,32)"
                    />
                  </g>
                  {/* Sun — the small filled circle/dot */}
                  <g transform="matrix(0.124767,0,0,0.124767,5464.843815,201.991231)">
                    <path
                      d="M39636.318,1931.337C39765.343,1379.343 40614.93,1442.198 40614.707,1915.304C40300.504,1893.245 39976.656,1874.99 39636.318,1931.337Z"
                      fill="rgb(35,31,32)"
                    />
                  </g>
                </g>
                {/* Arc / orbit line */}
                <g transform="matrix(0.215217,0,0,0.215217,1210.121273,68.905742)">
                  <path
                    d="M42396.021,1835.222C42381.99,1838.336 42368.07,1829.473 42364.955,1815.442C42361.84,1801.411 42370.703,1787.49 42384.735,1784.376C42776.149,1697.492 43276.334,1668.462 43667.748,1784.837C43681.525,1788.933 43689.384,1803.444 43685.288,1817.22C43681.192,1830.997 43666.682,1838.857 43652.905,1834.76C43269.462,1720.755 42779.464,1750.107 42396.021,1835.222Z"
                    fill="rgb(35,31,32)"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
