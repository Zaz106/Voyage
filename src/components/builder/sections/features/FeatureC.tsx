"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD } from "../_shared/styles";
import styles from "./FeatureC.module.css";

/* Simple inline SVG icons matching the reference */
const icons = [
  /* Client-Centric — people/target */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" key="i1">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>,
  /* Strategic Thinking — lightbulb */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" key="i2">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
  </svg>,
  /* Creative Excellence — pen tool */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" key="i3">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>,
  /* Timely Delivery — clock */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" key="i4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>,
];

const FeatureSection: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const heading = ct.heading ?? "Passionate Creators,\nInnovators, And Visionaries";
  const subtitle =
    ct.subtitle ??
    "We are a team of visionary creators, strategists, and technologists. With a deep passion for design and a commitment to excellence.";
  const badge = ct.badge ?? "Who We Are";

  const cards = [
    {
      title: ct.card1Title ?? "Client-Centric Approach",
      desc: ct.card1Desc ?? "We listen closely and craft every pixel with your goals in mind, ensuring a tailored and purposeful design.",
    },
    {
      title: ct.card2Title ?? "Strategic Thinking",
      desc: ct.card2Desc ?? "Every decision is backed by strategy. We ensure Honesta's vision aligns with real business outcomes.",
    },
    {
      title: ct.card3Title ?? "Creative Excellence",
      desc: ct.card3Desc ?? "From bold visuals to micro-interactions, we pursue creativity that resonates and elevates every touchpoint.",
    },
    {
      title: ct.card4Title ?? "Timely Delivery",
      desc: ct.card4Desc ?? "We respect your time. Projects are scoped, planned and delivered on schedule without compromising quality.",
    },
  ];

  const isDark = theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#fff";
  const cardBg = isDark ? "#151515" : "#f7f7f7";
  const headingColor = colors.primary;
  const textColor = colors.paragraph;
  const border = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const badgeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const showBadge = globalStyles.showBadge;

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={styles.container}>
        {/* Left — heading + subtitle */}
        <div className={styles.left}>
          {showBadge && (
            <div
              className={styles.badge}
              style={{ background: badgeBg, color: colors.accent, fontFamily: fonts.body }}
            >
              <span className={styles.badgeDot} style={{ background: colors.accent }} />
              {badge}
            </div>
          )}
          <h2
            className={styles.heading}
            style={{ color: headingColor, fontFamily: fonts.heading, whiteSpace: "pre-line" }}
          >
            {heading}
          </h2>
          <p className={styles.subtitle} style={{ color: textColor, fontFamily: fonts.body }}>
            {subtitle}
          </p>
        </div>

        {/* Right — 2×2 cards */}
        <div className={styles.grid}>
          {cards.map((c, i) => (
            <div
              key={c.title}
              className={styles.card}
              style={{
                background: cardBg,
                borderRadius: RADIUS_CARD[borderRadius],
                border: `1px solid ${border}`,
              }}
            >
              <div className={styles.iconWrap} style={{ color: headingColor }}>
                {icons[i]}
              </div>
              <h3
                className={styles.cardTitle}
                style={{ color: headingColor, fontFamily: fonts.heading }}
              >
                {c.title}
              </h3>
              <p className={styles.cardDesc} style={{ color: textColor, fontFamily: fonts.body }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
