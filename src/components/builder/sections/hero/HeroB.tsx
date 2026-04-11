"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, buttonStyles } from "../_shared/styles";
import styles from "./HeroB.module.css";
import layout from "../_shared/layout.module.css";

const HeroB: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const label = ct.label ?? "Welcome";
  const heading = ct.heading ?? "We craft digital\nexperiences that matter";
  const subheading = ct.subheading ?? "Strategy, design and technology \u2014 fused into seamless products people love to use.";
  const primaryBtn = ct.primaryBtn ?? "View Our Work";

  const btn = buttonStyles(globalStyles);

  return (
    <div className={styles.hero} style={{ background: theme === "dark" ? "#0a0a0a" : "#fafafa" }}>
      <div className={layout.inner}>
        <div className={styles.content}>
          <div className={styles.label} style={{ color: colors.accent, fontFamily: fonts.body }}>
            {label}
          </div>
          <h1 className={styles.heading} style={{ color: colors.primary, fontFamily: fonts.heading }}>
            {heading}
          </h1>
          <p className={styles.subheading} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
            {subheading}
          </p>
          <div className={styles.btn} style={{ ...btn, fontFamily: fonts.body }}>
            {primaryBtn}
          </div>
        </div>
        <div
          className={styles.image}
          style={{
            background: theme === "dark"
              ? "linear-gradient(135deg, #151515, #1e1e1e)"
              : "linear-gradient(135deg, #eee, #e0e0e0)",
            borderRadius: RADIUS_CARD[borderRadius],
            color: colors.paragraph,
          }}
        >
          Image Placeholder
        </div>
      </div>
    </div>
  );
};

export default HeroB;
