"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS, contrastText } from "../_shared/styles";
import styles from "./GradientCTA.module.css";

/**
 * Gradient CTA — animated cloud-like atmospheric blobs over a warm scenic base.
 */
const GradientCTA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, fonts } = globalStyles;
  const r = RADIUS[borderRadius];
  const ct = sectionContent[sectionId] ?? {};

  const heading = ct.heading ?? "Clarity, structure, and speed for your workflow";
  const btnText = ct.btnText ?? "Get Started";

  const btnBg     = buttonStyle === "filled" ? colors.primary : "transparent";
  const btnColor  = buttonStyle === "filled" ? contrastText(colors.primary) : colors.primary;
  const btnBorder = buttonStyle === "outlined" ? `1.5px solid ${colors.primary}` : "none";

  return (
    <div
      className={styles.scene}
      style={{
        padding: "96px 48px 80px",
        background: "linear-gradient(160deg, #f8ece0 0%, #eedff3 40%, #e8e4f5 65%, #f4f2fa 100%)",
        textAlign: "center",
      }}
    >
      {/* Blob 1 — accent cloud */}
      <div
        className={`${styles.blob} ${styles.blob1}`}
        style={{
          width: 560,
          height: 560,
          top: "-5%",
          left: "5%",
          background: `${colors.accent}32`,
        }}
      />
      {/* Blob 2 — warm peach */}
      <div
        className={`${styles.blob} ${styles.blob2}`}
        style={{
          width: 420,
          height: 420,
          top: "10%",
          right: "8%",
          background: "rgba(255, 190, 145, 0.28)",
        }}
      />
      {/* Blob 3 — lavender */}
      <div
        className={`${styles.blob} ${styles.blob3}`}
        style={{
          width: 380,
          height: 380,
          bottom: "-10%",
          left: "30%",
          background: "rgba(190, 175, 240, 0.28)",
        }}
      />

      <div className={styles.content}>
        <h2
          style={{
            fontSize: "clamp(28px, 3cqi, 40px)",
            fontWeight: 400,
            color: "rgba(20, 10, 10, 0.88)",
            maxWidth: 560,
            margin: "0 auto 36px",
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            fontFamily: `"${fonts.heading}", sans-serif`,
          }}
        >
          {heading}
        </h2>

        <button
          style={{
            padding: "14px 36px",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: r,
            border: btnBorder,
            background: btnBg,
            color: btnColor,
            cursor: "pointer",
            letterSpacing: "-0.01em",
            fontFamily: `"${fonts.body}", sans-serif`,
          }}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default GradientCTA;
