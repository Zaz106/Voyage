"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS, RADIUS_CARD, contrastText } from "../_shared/styles";
import styles from "./SplitCTAFlipped.module.css";

/** Split CTA Flipped — content left, image right. */
const SplitCTAFlipped: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, theme, fonts } = globalStyles;
  const r = RADIUS[borderRadius];
  const cardR = RADIUS_CARD[borderRadius];
  const ct = sectionContent[sectionId] ?? {};

  const eyebrow      = ct.eyebrow      ?? "Our Offer";
  const heading      = ct.heading      ?? "Built for Scale, Designed for You";
  const f1Title      = ct.feature1Title ?? "Performance";
  const f1Desc       = ct.feature1Desc  ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const f2Title      = ct.feature2Title ?? "Reliability";
  const f2Desc       = ct.feature2Desc  ?? "Duis aute irure dolor in reprehenderit in voluptate velit.";
  const primaryBtn   = ct.primaryBtn   ?? "Get Started";
  const secondaryBtn = ct.secondaryBtn ?? "Learn More";
  const imageUrl     = ct.imageUrl     ?? "";

  const bg           = theme === "dark" ? "#0a0a0a" : "#f9f8f6";
  const headingColor = colors.primary;
  const textColor    = colors.paragraph;
  const eyebrowColor = theme === "dark" ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.4)";
  const dividerColor = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const btnBg     = buttonStyle === "filled" ? colors.accent : "transparent";
  const btnColor  = buttonStyle === "filled" ? contrastText(colors.accent) : colors.accent;
  const btnBorder = buttonStyle === "outlined" ? `1.5px solid ${colors.accent}` : "none";
  const btnSecondaryBorder = theme === "dark" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.2)";

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={styles.container}>
        {/* Left: content */}
        <div className={styles.content}>
          {globalStyles.showBadge && (
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: eyebrowColor,
                margin: "0 0 10px",
                fontFamily: `"${fonts.body}", sans-serif`,
              }}
            >
              {eyebrow}
            </p>
          )}

          <h2
            className={styles.heading}
            style={{
              fontWeight: 700,
              color: headingColor,
              lineHeight: 1.25,
              fontFamily: `"${fonts.heading}", sans-serif`,
            }}
          >
            {heading}
          </h2>

          {/* Feature list */}
          <div style={{ marginBottom: 30 }}>
            {[
              { title: f1Title, desc: f1Desc },
              { title: f2Title, desc: f2Desc },
            ].map(({ title, desc }, i) => (
              <div key={i}>
                {i > 0 && (
                  <div
                    style={{
                      borderTop: `1px solid ${dividerColor}`,
                      margin: "14px 0",
                    }}
                  />
                )}
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: headingColor,
                    margin: "0 0 3px",
                    fontFamily: `"${fonts.body}", sans-serif`,
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: textColor,
                    margin: 0,
                    lineHeight: 1.6,
                    fontFamily: `"${fonts.body}", sans-serif`,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* Buttons */}
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
                border: `1.5px solid ${btnSecondaryBorder}`,
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

        {/* Right: visual block */}
        <div
          className={styles.visual}
          style={{
            borderRadius: cardR,
            background: imageUrl
              ? `url(${imageUrl}) center / cover no-repeat`
              : theme === "dark"
              ? "linear-gradient(135deg, #151515, #1e1e1e)"
              : "linear-gradient(135deg, #eee, #e0e0e0)",
            color: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)",
            fontFamily: `"${fonts.body}", sans-serif`,
          }}
        >
          {!imageUrl && "Image Placeholder"}
        </div>
      </div>
    </div>
  );
};

export default SplitCTAFlipped;
