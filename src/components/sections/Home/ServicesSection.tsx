"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import styles from "./ServicesSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    number: "01",
    title: "Web Design & Development",
    description:
      "We craft fast, conversion-focused websites and web applications — from polished marketing sites to complex platforms — built for performance and built to last.",
    image: "/images/service-image-1.png",
    alt: "Web design and development showcase",
  },
  {
    number: "02",
    title: "Mobile App Development",
    description:
      "Native and cross-platform apps that users actually return to. We design and engineer mobile experiences that feel right in the hand — intuitive, fast, and refined.",
    image: "/images/service-image-2.png",
    alt: "Mobile app development showcase",
  },
  {
    number: "03",
    title: "Brand Identity & Design",
    description:
      "From naming to full visual systems, we build brands with personality and purpose. Every mark, typeface, and colour decision is rooted in strategy.",
    image: "/images/service-image-3.png",
    alt: "Brand identity and design showcase",
  },
  {
    number: "04",
    title: "Strategy & Consulting",
    description:
      "Before we write a line of code, we think. We partner with founders and product teams to map the right path — cutting waste, accelerating clarity.",
    image: "/images/service-image-4.png",
    alt: "Strategy and consulting showcase",
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    // Cards 2–4 wait below the fold
    gsap.set(cards.slice(1), { yPercent: 100 });

    // Each card gets 100vh to slide in, then 120vh of dwell before the next.
    // Total per transition: 220vh. With 3 transitions (4 cards) = 660vh.
    const SLIDE = 1;   // timeline units for the slide-in
    const DWELL = 1.2; // timeline units the card holds before next slides in

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: "top top",
        end: `+=${(SERVICES.length - 1) * (SLIDE + DWELL) * 100}vh`,
        scrub: 1,
      },
    });

    cards.slice(1).forEach((card) => {
      tl.to(card, {
        yPercent: 0,
        ease: "none",
        duration: SLIDE,
      });
      // Dwell: card sits fully in view while the user keeps scrolling
      tl.to({}, { duration: DWELL });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.services} aria-label="Our services">
      {SERVICES.map((service, i) => (
        <div
          key={service.number}
          ref={(el) => { cardRefs.current[i] = el; }}
          className={styles.card}
          aria-label={`Service ${service.number}: ${service.title}`}
        >
          <div className={styles.cardInner}>

            {/* ── Left: text ── */}
            <div className={styles.cardLeft}>
              <p className={styles.eyebrow}>+ What We Offer</p>
              <h2 className={styles.title}>
                <span className={styles.number}>{service.number}.</span>
                {service.title}
              </h2>
              <p className={styles.description}>{service.description}</p>
            </div>

            {/* ── Right: image ── */}
            <div className={styles.cardRight}>
              <div className={styles.imageWrap}>
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 58vw"
                  priority={i === 0}
                />
              </div>
            </div>

          </div>
        </div>
      ))}
    </section>
  );
}
