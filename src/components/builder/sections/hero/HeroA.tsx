"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { themeBg, buttonStyles, ghostButtonStyles } from "../_shared/styles";
import styles from "./HeroA.module.css";
import layout from "../_shared/layout.module.css";

const HeroA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const heading = ct.heading ?? "Build beautiful websites\nwithout the complexity";
  const subheading = ct.subheading ?? "A modern, intuitive web builder that lets you bring your vision to life with zero friction.";
  const primaryBtn = ct.primaryBtn ?? "Start Building";
  const secondaryBtn = ct.secondaryBtn ?? "Learn More";

  const btn = buttonStyles(globalStyles);
  const ghost = ghostButtonStyles(theme, borderRadius);

  return (
    <div className={styles.hero} style={{ background: theme === "dark" ? "#0a0a0a" : "#fafafa" }}>
      <div className={layout.inner}>
        <h1 className={styles.heading} style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {heading}
        </h1>
        <p className={styles.subheading} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
          {subheading}
        </p>
        <div className={styles.buttons}>
          <div className={styles.btn} style={{ ...btn, fontFamily: fonts.body }}>
            {primaryBtn}
          </div>
          <div className={styles.btn} style={{ ...ghost, fontFamily: fonts.body }}>
            {secondaryBtn}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroA;
