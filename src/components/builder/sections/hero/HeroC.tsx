"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { buttonStyles } from "../_shared/styles";
import styles from "./HeroC.module.css";
import layout from "../_shared/layout.module.css";

const HeroC: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const word1 = ct.word1 ?? "SOFTWARE";
  const word2 = ct.word2 ?? "SOLUTIONS";
  const description = ct.description ?? "We design, develop, and deploy scalable digital products that help companies grow faster and operate smarter.";
  const ctaText = ct.ctaText ?? "Explore More";

  const bg = `radial-gradient(ellipse 120% 60% at 50% 20%, ${colors.accent}33 0%, transparent 70%), linear-gradient(180deg, ${theme === "dark" ? "#111" : "#222"} 0%, ${theme === "dark" ? "#0a0a0a" : "#111"} 100%)`;
  const textColor = "#fff";
  const textMuted = "rgba(255,255,255,0.7)";

  return (
    <div className={styles.hero} style={{ background: bg }}>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.contentWrapper}>
        <div className={layout.inner}>
          <div className={styles.contentInner}>
            <h1 className={styles.heading} style={{ color: textColor, fontFamily: fonts.heading }}>
              <span className={styles.word}>{word1}</span>
              <span className={styles.separator}>—</span>
              <span className={styles.word}>{word2}</span>
            </h1>

            <div className={styles.gridFooter}>
              <p className={styles.description} style={{ color: textMuted, fontFamily: fonts.body }}>
                {description}
              </p>
              <div className={styles.actions}>
                <button
                  className={styles.exploreBtn}
                  style={{ color: textColor, fontFamily: fonts.body }}
                >
                  {ctaText}
                  <span className={styles.arrow}>↓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroC;
