"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS } from "../_shared/styles";
import styles from "./ImmersiveCTA.module.css";

/**
 * Immersive CTA — dark atmospheric section that mirrors the ImmersiveFooter's visual
 * language so the two flow seamlessly when stacked.
 */
const ImmersiveCTA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, fonts } = globalStyles;
  const r = RADIUS[borderRadius];
  const ct = sectionContent[sectionId] ?? {};

  const heading     = ct.heading     ?? "Let's build something extraordinary together.";
  const description = ct.description ?? "Get in touch to start your next project. We'd love to hear from you.";
  const primaryBtn  = ct.primaryBtn  ?? "Get Started";
  const secondaryBtn = ct.secondaryBtn ?? "Learn More";

  const textBright = "rgba(255,255,255,0.9)";
  const textMuted  = "rgba(255,255,255,0.5)";

  const btnBg     = buttonStyle === "filled" ? "#fff" : "transparent";
  const btnColor  = buttonStyle === "filled" ? "#000" : "#fff";
  const btnBorder = buttonStyle === "outlined" ? "1.5px solid rgba(255,255,255,0.5)" : "none";
  const ghostBorder = "rgba(255,255,255,0.18)";

  return (
    <div className={styles.section}>
      {/* Background — matches ImmersiveFooter palette */}
      <div className={styles.bgLayer}>
        <div
          className={styles.bgGradient}
          style={{
            background: `radial-gradient(ellipse 120% 60% at 50% 80%, ${colors.accent}4d 0%, transparent 70%), linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 20, 35, 0.7) 100%)`,
          }}
        />
        <div className={styles.bgOverlay} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h2
          className={styles.heading}
          style={{
            color: textBright,
            fontFamily: `"${fonts.heading}", sans-serif`,
          }}
        >
          {heading}
        </h2>

        <p
          className={styles.description}
          style={{
            color: textMuted,
            fontFamily: `"${fonts.body}", sans-serif`,
          }}
        >
          {description}
        </p>

        <div className={styles.buttons}>
          <button
            style={{
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: r,
              border: btnBorder,
              background: btnBg,
              color: btnColor,
              cursor: "pointer",
              fontFamily: `"${fonts.body}", sans-serif`,
            }}
          >
            {primaryBtn}
          </button>
          <button
            style={{
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: r,
              border: `1.5px solid ${ghostBorder}`,
              background: "transparent",
              color: textBright,
              cursor: "pointer",
              fontFamily: `"${fonts.body}", sans-serif`,
            }}
          >
            {secondaryBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveCTA;
