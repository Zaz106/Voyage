"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD } from "../_shared/styles";
import styles from "./FeatureE.module.css";

const FeatureSection: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts, buttonStyle } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const heading = ct.heading ?? "We Blend Beauty\nAnd Functionality\nSeamlessly";
  const subtitle =
    ct.subtitle ??
    "Our user-friendly designs make navigating a breeze, ensuring visitors enjoy both seamless experiences and make.";
  const ctaText = ct.ctaText ?? "Get In Touch Now";
  const badge = ct.badge ?? "Our Approach";

  const isDark = theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#fff";
  const headingColor = colors.primary;
  const textColor = colors.paragraph;
  const badgeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const showBadge = globalStyles.showBadge;

  const isFilled = buttonStyle === "filled";
  const btnStyle: React.CSSProperties = isFilled
    ? {
        background: colors.accent,
        color: "#fff",
        padding: "10px 22px",
        borderRadius: RADIUS_CARD[borderRadius],
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        fontFamily: fonts.body,
      }
    : {};

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={styles.container}>
        {/* Left — content */}
        <div className={styles.content}>
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

          {isFilled ? (
            <button style={btnStyle}>{ctaText}</button>
          ) : (
            <span
              className={styles.cta}
              style={{ color: headingColor, fontFamily: fonts.body }}
            >
              {ctaText}
              <span className={styles.ctaArrow}>→</span>
            </span>
          )}
        </div>

        {/* Right — image placeholder */}
        <div
          className={styles.imageWrap}
          style={{
            background: isDark
              ? "linear-gradient(135deg, #151515, #1e1e1e)"
              : "linear-gradient(135deg, #eee, #e0e0e0)",
            borderRadius: RADIUS_CARD[borderRadius],
            color: textColor,
            fontSize: 14,
            fontFamily: fonts.body,
          }}
        >
          Image Placeholder
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
