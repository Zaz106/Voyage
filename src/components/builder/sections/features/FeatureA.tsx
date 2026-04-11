"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, themeBg, themeCardBg, themeBorder } from "../_shared/styles";
import styles from "./FeatureA.module.css";
import layout from "../_shared/layout.module.css";

const FeatureA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "Features";
  const subtitle = ct.subtitle ?? "Everything you need to build a standout website.";
  const features = [
    { title: ct.card1Title ?? "Lightning Fast", desc: ct.card1Desc ?? "Optimised performance out of the box with near-instant load times." },
    { title: ct.card2Title ?? "Pixel Perfect", desc: ct.card2Desc ?? "Every element is crafted to be crisp and precise on any screen size." },
    { title: ct.card3Title ?? "Fully Responsive", desc: ct.card3Desc ?? "Layouts that automatically adapt to any device or viewport." },
  ];

  return (
    <div className={styles.section} style={{ background: themeBg(theme) }}>
      <div className={layout.inner}>
        <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {title}
        </h2>
        <p className={styles.subtitle} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
          {subtitle}
        </p>
        <div className={styles.grid}>
          {features.map((f) => (
            <div
              key={f.title}
              className={styles.card}
              style={{
                background: themeCardBg(theme),
                borderRadius: RADIUS_CARD[borderRadius],
                border: `1px solid ${themeBorder(theme)}`,
              }}
            >
              <div
                className={styles.icon}
                style={{ borderRadius: RADIUS_CARD[borderRadius], background: colors.accent }}
              />
              <h3 className={styles.cardTitle} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                {f.title}
              </h3>
              <p className={styles.cardDesc} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                {f.desc}
              </p>
      </div>
        ))}
      </div>
          </div>
    </div>
  );
};

export default FeatureA;
