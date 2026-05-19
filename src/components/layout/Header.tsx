"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import Shuffle from "@/components/ui/Shuffle";
import styles from "./Header.module.css";

const SHUFFLE_PROPS = {
  shuffleDirection: "right" as const,
  duration: 0.35,
  animationMode: "evenodd" as const,
  shuffleTimes: 1,
  ease: "power2.out",
  stagger: 0.02,
  threshold: 0.1,
  triggerOnce: false,
  triggerOnHover: true,
  respectReducedMotion: true,
  loop: false,
  tag: "span" as const,
  textAlign: "left" as const,
  style: { lineHeight: "inherit", fontSize: "inherit", fontFamily: "inherit", letterSpacing: "inherit", textTransform: "inherit" as React.CSSProperties["textTransform"] },
  skipInitialPlay: true,
};

const DROPDOWN_SHUFFLE_PROPS = {
  ...SHUFFLE_PROPS,
  threshold: 0,
  rootMargin: "0px",
  skipInitialPlay: true,
};

function DropdownCard({ label, href, onClose }: { label: string; href: string; onClose: () => void }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    const shuffleEl = cardRef.current?.querySelector<HTMLElement>(".shuffle-parent");
    if (shuffleEl) {
      shuffleEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    }
  };

  return (
    <Link
      ref={cardRef}
      href={href}
      className={styles.dropdownItem}
      onClick={onClose}
      onMouseEnter={handleMouseEnter}
    >
      <div className={styles.dropdownThumb} aria-hidden="true" />
      <span className={styles.dropdownLabel}>
        <Shuffle {...DROPDOWN_SHUFFLE_PROPS} text={label} />
      </span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function MobileSubCard({ label, href, onClose, refCallback }: { label: string; href: string; onClose: () => void; refCallback?: (el: HTMLAnchorElement | null) => void }) {
  const cardRef = useRef<HTMLAnchorElement | null>(null);

  const handleMouseEnter = () => {
    const shuffleEl = cardRef.current?.querySelector<HTMLElement>(".shuffle-parent");
    if (shuffleEl) {
      shuffleEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    }
  };

  return (
    <Link
      ref={(el) => { cardRef.current = el; refCallback?.(el); }}
      href={href}
      className={styles.mobileNavSubCard}
      onClick={onClose}
      onMouseEnter={handleMouseEnter}
    >
      <div className={styles.mobileNavCardThumb} aria-hidden="true" />
      <span className={styles.mobileNavCardLabel}>
        <Shuffle {...DROPDOWN_SHUFFLE_PROPS} text={label} />
      </span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownClosing, setDropdownClosing] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileCaseStudiesOpen, setMobileCaseStudiesOpen] = useState(false);
  const [mobileCaseStudiesClosing, setMobileCaseStudiesClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLElement>(null);
  const logoIconRef = useRef<SVGGElement>(null);
  const logoVoyageRef = useRef<SVGGElement>(null);
  const logoVisualsRef = useRef<SVGGElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileLinkRefs = useRef<(HTMLElement | null)[]>([]);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  const touchStartYRef = useRef(0);
  const mobileSubCardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  // ref to the latest sample fn so pathname effect can call it without stale closure
  const sampleFnRef = useRef<() => void>(() => {});

  // Entrance animation — triggered by PageLoader's loaderComplete event
  useEffect(() => {
    const nav = navRef.current;
    const icon = logoIconRef.current;
    const voyage = logoVoyageRef.current;
    const visuals = logoVisualsRef.current;
    if (!nav || !icon || !voyage || !visuals) return;

    // Hide everything so nothing shows during the page loader
    gsap.set(nav, { clipPath: 'inset(0 0 0 100%)' });
    gsap.set(icon, { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(voyage, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(visuals, { clipPath: 'inset(0 100% 0 0)' });

    const handleLoaderComplete = () => {
      const items = Array.from(
        nav.querySelectorAll<HTMLElement>(`.${styles.navLink}, .${styles.navCta}`)
      ).reverse();
      gsap.set(items, { y: 10, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Icon paints bottom to top (matches page loader style)
      tl.to(icon, { clipPath: 'inset(0% 0 0 0)', duration: 0.85 }, 0);

      // VOYAGE slides in left to right
      tl.to(voyage, { clipPath: 'inset(0 0% 0 0)', duration: 0.6 }, 0.2);

      // VISUALS slides in left to right slightly after
      tl.to(visuals, { clipPath: 'inset(0 0% 0 0)', duration: 0.5 }, 0.4);

      // Nav pill expands right to left simultaneously
      tl.to(nav, { clipPath: 'inset(0 0 0 0%)', duration: 1 }, 0);

      // Items roll up from bottom, staggered right to left
      tl.to(items, { y: 0, opacity: 1, duration: 1, stagger: 0.1 }, 0.2);

      // Clear nav clip-path so dropdown can overflow normally
      tl.call(() => gsap.set(nav, { clearProps: 'clipPath' }));
    };

    window.addEventListener('loaderComplete', handleLoaderComplete, { once: true });
    return () => window.removeEventListener('loaderComplete', handleLoaderComplete);
  }, []);

  // Hide on scroll down, reveal on scroll up
  useEffect(() => {
    const showThreshold = 80;   // always visible near top
    const deltaThreshold = 6;   // ignore tiny jitter
    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;
      if (current < showThreshold) {
        setHidden(false);
      } else if (delta > deltaThreshold) {
        setHidden(true);
      } else if (delta < -deltaThreshold) {
        setHidden(false);
      }
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (unmountTimer.current) clearTimeout(unmountTimer.current);
    setDropdownClosing(false);
    setDropdownOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      setDropdownClosing(true);
      unmountTimer.current = setTimeout(() => {
        setDropdownOpen(false);
        setDropdownClosing(false);
      }, 220);
    }, 250);
  };

  const handleMobileCardMouseEnter = (index: number) => {
    const el = mobileLinkRefs.current[index];
    const shuffleEl = el?.querySelector<HTMLElement>(".shuffle-parent");
    if (shuffleEl) {
      shuffleEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (mobileMenuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  // Build the mobile menu GSAP timeline once on mount
  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const items = mobileLinkRefs.current.filter(Boolean) as HTMLElement[];

    gsap.set(menu, { autoAlpha: 0 });
    gsap.set(items, { y: 20, opacity: 0 });

    menuTlRef.current = gsap.timeline({ paused: true, onReverseComplete: () => { setMobileCaseStudiesOpen(false); setMobileCaseStudiesClosing(false); } })
      .to(menu, { autoAlpha: 1, duration: 0.3, ease: 'power2.inOut' })
      .to(items, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: 'power2.out' }, 0.1);
  }, []);

  // Lock body scroll and play/reverse the menu timeline
  useLayoutEffect(() => {
    const tl = menuTlRef.current;
    if (!tl) return;
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      tl.play();
    } else {
      document.body.style.overflow = '';
      const subCards = mobileSubCardRefs.current.filter(Boolean) as HTMLElement[];
      if (subCards.length) {
        gsap.killTweensOf(subCards);
        gsap.to(subCards, { y: -8, opacity: 0, stagger: 0.04, duration: 0.22, ease: 'power2.in' });
      }
      tl.reverse();
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Animate Case Studies sub-items in when accordion opens
  useLayoutEffect(() => {
    if (!mobileCaseStudiesOpen) return;
    const subCards = mobileSubCardRefs.current.filter(Boolean) as HTMLElement[];
    if (!subCards.length) return;
    gsap.fromTo(
      subCards,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.35, ease: 'power2.out' }
    );
  }, [mobileCaseStudiesOpen]);

  // Animate Case Studies sub-items out when accordion manually closes
  useLayoutEffect(() => {
    if (!mobileCaseStudiesClosing) return;
    const subCards = mobileSubCardRefs.current.filter(Boolean) as HTMLElement[];
    if (!subCards.length) {
      setMobileCaseStudiesOpen(false);
      setMobileCaseStudiesClosing(false);
      return;
    }
    gsap.killTweensOf(subCards);
    gsap.to(subCards, {
      y: 10,
      opacity: 0,
      stagger: { each: 0.07, from: 'end' },
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        setMobileCaseStudiesOpen(false);
        setMobileCaseStudiesClosing(false);
      },
    });
  }, [mobileCaseStudiesClosing]);

  // Adaptive colour — samples DOM behind header on scroll/resize/route-change
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    let currentLum = 0;
    let targetLum = 0;
    let animRafId: number | null = null;
    let sampleRafId: number | null = null;

    function applyLum(lum: number) {
      // Remap: below 0.55 → pure white; above 0.85 → pure black.
      // Wider white zone means dark AND medium backgrounds (video, overlays) stay
      // white; only genuinely bright/white sections flip the logo to black.
      const t = Math.max(0, Math.min(1, (lum - 0.55) / 0.30));
      headerEl!.style.setProperty('--logo-invert', (1 - t).toFixed(4));
      const g = Math.round((1 - t) * 255);
      headerEl!.style.setProperty('--header-fg', `rgb(${g},${g},${g})`);
    }

    function animLoop() {
      const diff = targetLum - currentLum;
      if (Math.abs(diff) < 0.002) {
        currentLum = targetLum;
        applyLum(currentLum);
        animRafId = null;
        return;
      }
      currentLum += diff * 0.1;
      applyLum(currentLum);
      animRafId = requestAnimationFrame(animLoop);
    }

    // 1×1 canvas reused for pixel-accurate sampling of video/image elements
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 1;
    sampleCanvas.height = 1;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    function sampleLum(x: number, y: number): number {
      // Pass 1: query ALL <video> elements directly — bypasses pointer-events:none which
      // document.elementsFromPoint omits, causing hero videos behind pointer-events:none
      // containers (e.g. .bg { pointer-events: none }) to be missed.
      for (const video of document.querySelectorAll<HTMLVideoElement>('video')) {
        if (headerEl!.contains(video)) continue;
        const r2 = video.getBoundingClientRect();
        if (r2.width > 0 && r2.height > 0 &&
            x >= r2.left && x <= r2.right &&
            y >= r2.top && y <= r2.bottom) {
          if (sampleCtx && video.readyState >= 2 && video.videoWidth > 0) {
            try {
              sampleCtx.drawImage(video,
                ((x - r2.left) / r2.width) * video.videoWidth,
                ((y - r2.top) / r2.height) * video.videoHeight,
                1, 1, 0, 0, 1, 1);
              const d = sampleCtx.getImageData(0, 0, 1, 1).data;
              if (d[3] > 25) return (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
            } catch { /* cross-origin */ }
          }
          return 0; // video at this coordinate → treat as dark
        }
      }

      // Pass 2: elementsFromPoint for CSS backgrounds and images
      const els = document.elementsFromPoint(x, y);
      for (const el of els) {
        if (el === headerEl || headerEl!.contains(el)) continue;
        if (el instanceof HTMLCanvasElement) continue; // skip overlays (ClickSpark, etc.)

        // Image: read actual pixel, or treat as opaque
        if (el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0) {
          try {
            if (sampleCtx) {
              const r2 = el.getBoundingClientRect();
              sampleCtx.drawImage(el,
                ((x - r2.left) / r2.width) * el.naturalWidth,
                ((y - r2.top) / r2.height) * el.naturalHeight,
                1, 1, 0, 0, 1, 1);
              const d = sampleCtx.getImageData(0, 0, 1, 1).data;
              if (d[3] > 25) return (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
            }
          } catch { /* cross-origin */ }
          return 0;
        }

        const elStyle = window.getComputedStyle(el);

        // Solid CSS background-color
        const bgColor = elStyle.backgroundColor;
        const cm = bgColor.match(/[\d.]+/g);
        if (cm && cm.length >= 3) {
          const a = cm.length >= 4 ? +cm[3] : 1;
          if (a > 0.1) return (0.299 * +cm[0] + 0.587 * +cm[1] + 0.114 * +cm[2]) / 255;
        }

        // CSS background-image (gradient or URL)
        const bgImg = elStyle.backgroundImage;
        if (bgImg && bgImg !== 'none') {
          if (bgImg.includes('gradient')) {
            const stops = bgImg.match(/rgba?\([^)]+\)/g);
            if (stops && stops.length > 0) {
              let sum = 0, count = 0;
              for (const s of stops) {
                const sm = s.match(/[\d.]+/g);
                if (sm && sm.length >= 3) {
                  sum += (0.299 * +sm[0] + 0.587 * +sm[1] + 0.114 * +sm[2]) / 255;
                  count++;
                }
              }
              if (count > 0) return sum / count;
            }
          }
          return 0; // opaque background-image (URL or unrecognised)
        }
      }
      return 0;
    }

    function sample() {
      const rect = headerEl!.getBoundingClientRect();
      const y = rect.top + rect.height / 2;
      // Average three evenly-spaced horizontal positions across the full header
      // width so a single bright corner of a background video doesn't skew the
      // result — we want the overall tone the header sits over, not one pixel.
      const lum = (
        sampleLum(rect.left + rect.width * 0.1, y) +
        sampleLum(rect.left + rect.width * 0.5, y) +
        sampleLum(rect.left + rect.width * 0.9, y)
      ) / 3;
      if (Math.abs(lum - targetLum) > 0.005) {
        targetLum = lum;
        if (!animRafId) animRafId = requestAnimationFrame(animLoop);
      }
    }

    sampleFnRef.current = sample;

    const onScroll = () => {
      if (sampleRafId) return;
      sampleRafId = requestAnimationFrame(() => { sample(); sampleRafId = null; });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', sample);
    sample();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', sample);
      if (animRafId) cancelAnimationFrame(animRafId);
      if (sampleRafId) cancelAnimationFrame(sampleRafId);
    };
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    // Show the header on every navigation — it may be hidden from the
    // previous page's scroll position with no scroll event to reset it.
    setHidden(false);
    lastScrollY.current = 0;
    const id = setTimeout(() => sampleFnRef.current(), 100);
    return () => clearTimeout(id);
  }, [pathname]);

  // Re-sample when the mobile menu opens/closes — the dark overlay changes the
  // visual background behind the header, but no scroll event fires to trigger it.
  useEffect(() => {
    // Opening: wait for GSAP fade-in (~300ms) before sampling the dark overlay
    // Closing: sample immediately (keep white during close anim) then again after
    //          the reverse animation completes (~550ms) to restore page colour
    const t1 = setTimeout(() => sampleFnRef.current(), menuOpen ? 320 : 0);
    const t2 = !menuOpen ? setTimeout(() => sampleFnRef.current(), 560) : null;
    return () => { clearTimeout(t1); if (t2 !== null) clearTimeout(t2); };
  }, [menuOpen]);

  // Restore header visibility when returning to this browser tab after being away.
  // rAF is paused while hidden so animLoop may have been cancelled; lastScrollY
  // can also be stale, leaving the header stuck off-screen with no scroll to fix it.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) return;
      // Sync the scroll baseline so the next scroll event computes delta correctly
      lastScrollY.current = window.scrollY;
      // Ensure header is visible when near the top
      if (window.scrollY < 80) setHidden(false);
      // Re-sample the background colour (rAF loop may have been cancelled)
      sampleFnRef.current();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <>
      <header ref={headerRef} className={`${styles.header} ${hidden ? styles.headerHidden : ""}`}>
        <Link href="/" className={styles.logo}>
          <svg
            viewBox="0 0 3500 1750"
            className={styles.logoImg}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Voyage"
            style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 } as React.CSSProperties}
          >
            {/* Icon: trail, sun, arc */}
            <g ref={logoIconRef}>
              <g transform="matrix(2.456152,0,0,2.470511,-24816.993185,-390.925398)">
                <g transform="matrix(1.115154,0,0,1.115154,-2065.810357,227.947144)">
                  <g transform="matrix(1,0,0,1,-9.113825,0)">
                    <g transform="matrix(1,0,0,1,647.973304,-273.314426)">
                      <g>
                        <g transform="matrix(0.088749,0,0,0.088749,8741.891444,265.991553)">
                          <path d="M19480.727,4519.198C19103.865,4216.133 19039.774,3975.856 19467.831,3757.54C19956.318,3508.405 19316.995,3197.98 19340.262,2934.848C19361.953,2689.549 19779.358,2431.692 19663.888,1924.969L19400.028,1924.969C19399.656,2444.682 18965.817,2608.274 18890,2842.569C18808.672,3093.896 19359.669,3527.405 18831,3673C18056.053,3886.42 18024.496,4213.599 17931,4521.675L19480.727,4519.198Z" fill="rgb(35,31,32)" />
                        </g>
                        <g transform="matrix(0.124767,0,0,0.124767,5464.843815,201.991231)">
                          <path d="M39636.318,1931.337C39765.343,1379.343 40614.93,1442.198 40614.707,1915.304C40300.504,1893.245 39976.656,1874.99 39636.318,1931.337Z" fill="rgb(35,31,32)" />
                        </g>
                      </g>
                      <g transform="matrix(0.215217,0,0,0.215217,1210.121273,68.905742)">
                        <path d="M42396.021,1835.222C42381.99,1838.336 42368.07,1829.473 42364.955,1815.442C42361.84,1801.411 42370.703,1787.49 42384.735,1784.376C42776.149,1697.492 43276.334,1668.462 43667.748,1784.837C43681.525,1788.933 43689.384,1803.444 43685.288,1817.22C43681.192,1830.997 43666.682,1838.857 43652.905,1834.76C43269.462,1720.755 42779.464,1750.107 42396.021,1835.222Z" fill="rgb(35,31,32)" />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
            {/* VOYAGE wordmark */}
            <g ref={logoVoyageRef}>
              <g transform="matrix(1.324402,0,0,1.332144,-49071.327486,-6272.593196)">
                <g transform="matrix(1.05191,0,0,1,-1966.817298,0)">
                  <text x="37888.897px" y="5365.479px" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: '382.808px', fill: 'rgb(35,31,32)' } as React.CSSProperties}>
                    V<tspan x="38162.902px 38462.551px 38699.413px 38966.145px 39295.559px" y="5365.479px 5365.479px 5365.479px 5365.479px 5365.479px">OYAGE</tspan>
                  </text>
                </g>
              </g>
            </g>
            {/* VISUALS subtext */}
            <g ref={logoVisualsRef}>
              <g transform="matrix(0.238823,0,0,0.233597,-1844.901421,-1737.288001)">
                <g transform="matrix(1.05191,0,0,1,-764.595542,0)">
                  <text x="14729.219px" y="12807.651px" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, fontSize: '1096.225px', fill: 'rgb(35,31,32)' } as React.CSSProperties}>
                    V<tspan x="15486.71px 15811.193px 16483.179px 17266.41px 18028.287px 18615.023px" y="12807.651px 12807.651px 12807.651px 12807.651px 12807.651px 12807.651px">ISUALS</tspan>
                  </text>
                </g>
              </g>
            </g>
          </svg>
        </Link>

        {/* Desktop nav */}
        <nav ref={navRef} className={styles.nav} aria-label="Main navigation">
          <Link href="/" className={styles.navLink}><Shuffle {...SHUFFLE_PROPS} text="Services" /></Link>
          <Link href="/" className={styles.navLink}><Shuffle {...SHUFFLE_PROPS} text="About Us" /></Link>
          <Link href="/" className={styles.navLink}><Shuffle {...SHUFFLE_PROPS} text="Pricing" /></Link>

          {/* Case Studies dropdown */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={openDropdown}
            onMouseLeave={scheduleClose}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={`${styles.navLink} ${styles.dropdownTrigger}`}
              aria-expanded={dropdownOpen}
            >
              <Shuffle {...SHUFFLE_PROPS} text="Case Studies" />
              <svg
                className={`${styles.chevron} ${dropdownOpen ? styles.chevronUp : ""}`}
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                className={`${styles.dropdown} ${dropdownClosing ? styles.dropdownOut : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  { label: "Branding & Identity", href: "/" },
                  { label: "Web Platforms",       href: "/" },
                  { label: "Mobile Products",     href: "/" },
                  { label: "Design Systems",      href: "/" },
                ].map(({ label, href }) => (
                  <DropdownCard
                    key={label}
                    label={label}
                    href={href}
                    onClose={() => setDropdownOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
          <Link href="/get-started" className={styles.navCta}>
            <Shuffle {...SHUFFLE_PROPS} text="Build w/ voyage" />
          </Link>
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        ref={mobileMenuRef}
        className={styles.mobileMenu}
        onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}
        onTouchStart={(e) => { touchStartYRef.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          const dy = e.changedTouches[0].clientY - touchStartYRef.current;
          if (dy > 80 && (mobileMenuRef.current?.scrollTop ?? 0) === 0) setMenuOpen(false);
        }}
      >
        {/* Nav cards — Services, About Us, Pricing */}
        {([
          { label: "Services", href: "/" },
          { label: "About Us", href: "/" },
          { label: "Pricing",  href: "/" },
        ] as const).map(({ label, href }, i) => (
          <Link
            key={label}
            href={href}
            ref={(el) => { mobileLinkRefs.current[i] = el; }}
            className={styles.mobileNavCard}
            onClick={() => setMenuOpen(false)}
            onMouseEnter={() => handleMobileCardMouseEnter(i)}
          >
            <div className={styles.mobileNavCardThumb} aria-hidden="true" />
            <span className={styles.mobileNavCardLabel}>
              <Shuffle {...DROPDOWN_SHUFFLE_PROPS} text={label} />
            </span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}

        {/* Case Studies — accordion toggle */}
        <button
          ref={(el) => { mobileLinkRefs.current[3] = el; }}
          className={styles.mobileNavCard}
          aria-expanded={mobileCaseStudiesOpen}
          onClick={() => {
            if (mobileCaseStudiesClosing) return;
            if (mobileCaseStudiesOpen) {
              setMobileCaseStudiesClosing(true);
            } else {
              setMobileCaseStudiesOpen(true);
            }
          }}
          onMouseEnter={() => handleMobileCardMouseEnter(3)}
        >
          <div className={styles.mobileNavCardThumb} aria-hidden="true" />
          <span className={styles.mobileNavCardLabel}>
            <Shuffle {...DROPDOWN_SHUFFLE_PROPS} text="Case Studies" />
          </span>
          <svg
            className={`${styles.mobileChevron} ${mobileCaseStudiesOpen ? styles.mobileChevronOpen : ""}`}
            width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
          >
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {mobileCaseStudiesOpen && (
          <div className={styles.mobileCaseStudiesItems}>
            {[
              { label: "Branding & Identity", href: "/" },
              { label: "Web Platforms",       href: "/" },
              { label: "Mobile Products",     href: "/" },
              { label: "Design Systems",      href: "/" },
            ].map(({ label, href }, idx) => (
              <MobileSubCard
                key={label}
                label={label}
                href={href}
                onClose={() => { setMenuOpen(false); setMobileCaseStudiesOpen(false); }}
                refCallback={(el) => { mobileSubCardRefs.current[idx] = el; }}
              />
            ))}
          </div>
        )}

        {/* Full-width CTA */}
        <Link
          href="/get-started"
          ref={(el) => { mobileLinkRefs.current[4] = el; }}
          className={styles.mobileNavCta}
          onClick={() => setMenuOpen(false)}
          onMouseEnter={() => handleMobileCardMouseEnter(4)}
        >
          <Shuffle {...DROPDOWN_SHUFFLE_PROPS} text="Build w/ Voyage" />
        </Link>
      </div>
    </>
  );
}
