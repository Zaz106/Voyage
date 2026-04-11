"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS } from "../_shared/styles";
import styles from "./DarkBannerCTA.module.css";

/**
 * Dark Banner CTA — deep dark background with animated accent glow filling the section.
 */
const DarkBannerCTA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, fonts } = globalStyles;
  const r = RADIUS[borderRadius];
  const ct = sectionContent[sectionId] ?? {};

  const heading      = ct.heading      ?? "Take the next step toward a better experience";
  const subheading   = ct.subheading   ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.";
  const primaryBtn   = ct.primaryBtn   ?? "Get Started";
  const secondaryBtn = ct.secondaryBtn ?? "Learn More";

  const btnBg     = buttonStyle === "filled" ? "#fff" : "transparent";
  const btnColor  = buttonStyle === "filled" ? "#000" : "#fff";
  const btnBorder = buttonStyle === "outlined" ? "1.5px solid rgba(255,255,255,0.5)" : "1.5px solid rgba(255,255,255,0.3)";

  return (
    <div
      className={styles.scene}
      style={{
        padding: "96px 48px 80px",
        background: "#08080f",
        textAlign: "center",
      }}
    >
      {/* Primary glow orb — large, centered */}
      <div
        className={`${styles.glow} ${styles.glow1}`}
        style={{
          width: 700,
          height: 700,
          top: "50%",
          background: `${colors.accent}65`,
        }}
      />
      {/* Secondary glow orb — offset for depth */}
      <div
        className={`${styles.glow} ${styles.glow2}`}
        style={{
          width: 420,
          height: 420,
          top: "40%",
          background: `${colors.accent}40`,
        }}
      />
      <div className={styles.content}>
        <h2
          style={{
            fontSize: "clamp(28px, 3cqi, 40px)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
            maxWidth: 660,
            margin: "0 auto 16px",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            fontFamily: `"${fonts.heading}", sans-serif`,
          }}
        >
          {heading}
        </h2>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            maxWidth: 380,
            margin: "0 auto 36px",
            lineHeight: 1.65,
            fontFamily: `"${fonts.body}", sans-serif`,
          }}
        >
          {subheading}
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
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
              letterSpacing: "-0.01em",
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
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.45)",
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

export default DarkBannerCTA;
