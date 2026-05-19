"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./AboutSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const PARAGRAPH =
  "We build the digital products that ambitious companies rely on — and the ones that quietly change how their customers feel. " +
  "Voyage was founded on a single belief: that great software should feel inevitable. " +
  "We partner with founders, operators, and growth teams to design and engineer products at the intersection of craft and performance — " +
  "from early-stage concepts to scaled platforms used by millions. " +
  "Every pixel, every interaction, every line of code is deliberate.";

const WORDS = PARAGRAPH.split(" ");

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Eyebrow fades in when section enters — scrubbed so it reverses cleanly
    gsap.fromTo(
      eyebrowRef.current,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 65%",
          scrub: 0.6,
        },
      }
    );

    // Words: scrub-driven opacity 0.06 → 1 across the full section scroll.
    // Wider layout = fewer lines = shorter section, so we open the window early
    // and hold it past the bottom to give every word time to illuminate.
    const wordEls = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
    gsap.set(wordEls, { opacity: 0.06 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        end: "bottom 55%",
        scrub: 0.6,
      },
    });

    tl.to(wordEls, {
      opacity: 1,
      ease: "none",
      stagger: 1 / wordEls.length,
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.about} aria-labelledby="about-heading">
      <div className={styles.inner}>
        <p ref={eyebrowRef} className={styles.eyebrow}>+ Our Story</p>

        <p className={styles.paragraph} id="about-heading">
          {WORDS.map((word, i) => (
            <span
              key={i}
              ref={(el) => { wordRefs.current[i] = el; }}
              className={styles.word}
            >
              {i < WORDS.length - 1 ? word + " " : word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
