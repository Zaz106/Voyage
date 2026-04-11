"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS, contrastText } from "../_shared/styles";
import styles from "./CenteredCTA.module.css";

/**
 * Centered CTA — clean, minimal, professional. Accent pill eyebrow,
 * large heading, description, two buttons. Floating card layout.
 */
const CenteredCTA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, theme, fonts } = globalStyles;
  const r = RADIUS[borderRadius];
  const ct = sectionContent[sectionId] ?? {};

  const eyebrow    = ct.eyebrow    ?? "Get Started";
  const heading    = ct.heading    ?? "Start building something great today";
  const description = ct.description ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.";
  const primaryBtn  = ct.primaryBtn  ?? "Get Started";
  const secondaryBtn = ct.secondaryBtn ?? "Learn More";

  const outerBg   = theme === "dark" ? "#020202" : "#f2f2f2";
  const cardBg    = theme === "dark" ? "#0d0d0d" : "#ffffff";
  const cardBorder = theme === "dark" ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = theme === "dark" ? "none" : "0 2px 0 rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.05)";
  const headingColor = colors.primary;
  const descColor    = colors.paragraph;
  const eyebrowBg    = `${colors.accent}18`;
  const eyebrowText  = colors.accent;

  const btnBg     = buttonStyle === "filled" ? colors.accent : "transparent";
  const btnColor  = buttonStyle === "filled" ? contrastText(colors.accent) : colors.accent;
  const btnBorder = buttonStyle === "outlined" ? `1.5px solid ${colors.accent}` : "none";

  const ghostBorder = theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.25)";

  return (
    <div className={styles.section} style={{ background: outerBg }}>
      <div
        className={styles.card}
        style={{
          background: cardBg,
          border: cardBorder,
          borderRadius: r === "999px" ? "24px" : r,
          boxShadow: cardShadow,
        }}
      >
        {/* Eyebrow pill */}
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
            margin: "0 auto 36px",
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

export default CenteredCTA;
