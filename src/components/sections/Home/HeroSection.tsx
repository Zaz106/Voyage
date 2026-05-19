"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Shuffle from "@/components/ui/Shuffle";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const SHUFFLE_PROPS = {
  shuffleDirection: "right" as const,
  duration: 0.35,
  animationMode: "evenodd" as const,
  shuffleTimes: 1,
  ease: "power2.out",
  stagger: 0.02,
  threshold: 0,
  rootMargin: "0px",
  triggerOnce: false,
  triggerOnHover: true,
  respectReducedMotion: true,
  loop: false,
  tag: "span" as const,
  textAlign: "left" as const,
  style: { lineHeight: "inherit", fontSize: "inherit", fontFamily: "inherit", letterSpacing: "inherit", textTransform: "inherit" as React.CSSProperties["textTransform"] },
};

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const descriptorRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);

  // Entrance animation — triggered by PageLoader's loaderComplete event
  useEffect(() => {
    gsap.set(headlineRef.current, { opacity: 0, y: 28 });
    gsap.set(descriptorRef.current, { opacity: 0, y: 20 });
    gsap.set(exploreBtnRef.current, { opacity: 0, y: 14 });
    gsap.set(bgRef.current, { scale: 1.05 });

    const handleLoaderComplete = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.to(bgRef.current, { scale: 1, duration: 1.2 }, 0);
      tl.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0);
      tl.to(descriptorRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0);
      tl.to(exploreBtnRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0);
    };

    if ((window as Window & { __loaderComplete?: boolean }).__loaderComplete) {
      handleLoaderComplete();
      return;
    }

    window.addEventListener('loaderComplete', handleLoaderComplete, { once: true });
    return () => window.removeEventListener('loaderComplete', handleLoaderComplete);
  }, []);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    const trigger = {
      trigger: section,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
    };

    // Video drifts up slowly (subtle depth) — all screen sizes
    gsap.to(bgRef.current, {
      y: "-20%",
      ease: "none",
      scrollTrigger: trigger,
    });

    const mm = gsap.matchMedia();

    // Desktop (>900px): headline inward-right, descriptor inward-left
    mm.add("(min-width: 901px)", () => {
      gsap.to(headlineRef.current, {
        y: -60, x: 80, opacity: 0, ease: "none", scrollTrigger: trigger,
      });
      gsap.to(descriptorRef.current, {
        y: -40, x: -60, opacity: 0, ease: "none", scrollTrigger: trigger,
      });
      gsap.to(exploreBtnRef.current, {
        y: -30, x: -40, opacity: 0, ease: "none", scrollTrigger: trigger,
      });
    });

    // Mobile (≤900px): stacked bottom-left layout — both drift straight up
    mm.add("(max-width: 900px)", () => {
      gsap.to(headlineRef.current, {
        y: -60, x: 0, opacity: 0, ease: "none", scrollTrigger: trigger,
      });
      gsap.to(descriptorRef.current, {
        y: -40, x: 0, opacity: 0, ease: "none", scrollTrigger: trigger,
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.hero}>
      {/* ── Background ── */}
      <div ref={bgRef} className={styles.bg}>
        <video
          className={styles.bgMedia}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/clouds.mp4" type="video/mp4" />
        </video>
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      {/* ── Headline (bottom-left) ── */}
      <div ref={headlineRef} className={styles.headlineBlock}>
        <h1 className={styles.headline}>
          Design<br />
          Without Limits<span className={styles.trademark}>™</span>
        </h1>
      </div>

      {/* ── Descriptor (right-middle) ── */}
      <div ref={descriptorRef} className={styles.descriptorBlock}>
        <p className={styles.descriptorTitle}>
          The digital product agency crafting exceptional software at scale.
        </p>
        <p className={styles.descriptorSub}>
          Turning ambitious ideas into products that perform and last.
        </p>
      </div>

      {/* ── Explore More link (bottom-right) ── */}
      <button
        ref={exploreBtnRef}
        className={styles.exploreBtn}
        aria-label="Scroll down"
        onClick={scrollDown}
      >
        <span className={styles.exploreBtnLabel}>
          <Shuffle {...SHUFFLE_PROPS} text="Explore More" />
        </span>
        <span className={styles.exploreArrowWrap}>
          <svg
            className={styles.exploreArrow}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7 1v11M1.5 7.5l5.5 5.5 5.5-5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </section>
  );
}

