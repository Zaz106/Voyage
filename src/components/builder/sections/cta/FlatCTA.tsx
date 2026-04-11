"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS, contrastText } from "../_shared/styles";
import styles from "./FlatCTA.module.css";

/**
 * Flat CTA — same centered layout as CenteredCTA but without the card wrapper.
 * Content sits directly on the section background.
 */
const FlatCTA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, theme, fonts } = globalStyles;
  const r = RADIUS[borderRadius];
  const ct = sectionContent[sectionId] ?? {};

  const eyebrow     = ct.eyebrow     ?? "Get Started";
  const heading     = ct.heading     ?? "Ready to bring your vision to life?";
  const description = ct.description ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.";
  const primaryBtn  = ct.primaryBtn  ?? "Get Started";
  const secondaryBtn = ct.secondaryBtn ?? "Learn More";

  const bg         = theme === "dark" ? "#0a0a0a" : "#ffffff";
  const headingColor = colors.primary;
  const descColor    = colors.paragraph;
  const eyebrowBg   = `${colors.accent}18`;
  const eyebrowText = colors.accent;

  const btnBg     = buttonStyle === "filled" ? colors.accent : "transparent";
  const btnColor  = buttonStyle === "filled" ? contrastText(colors.accent) : colors.accent;
  const btnBorder = buttonStyle === "outlined" ? `1.5px solid ${colors.accent}` : "none";
  const ghostBorder = theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.25)";

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={styles.container}>
        {globalStyles.showBadge && (
          <div
            style={{
              display: "inline-block",
              padding: "5px 14px",
              background: eyebrowBg,
              color: eyebrowText,
              borderRadius: "9999px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.04em",
              marginBottom: 20,
              fontFamily: `"${fonts.body}", sans-serif`,
            }}
          >
            {eyebrow}
          </div>
        )}

        <h2
          className={styles.heading}
          style={{
            fontWeight: 700,
            color: headingColor,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            fontFamily: `"${fonts.heading}", sans-serif`,
          }}
        >
          {heading}
        </h2>

        <p
          className={styles.description}
          style={{
            color: descColor,
            margin: "0 0 36px",
            lineHeight: 1.65,
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
              color: headingColor,
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

export default FlatCTA;
