"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, themeBg } from "../_shared/styles";
import styles from "./GalleryA.module.css";
import layout from "../_shared/layout.module.css";

const GalleryA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "Our Work";
  const subtitle = ct.subtitle ?? "A selection of projects we\u2019re proud of.";
  const placeholders = Array.from({ length: 6 }, (_, i) => i);

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
          {placeholders.map((i) => (
            <div
              key={i}
              className={styles.item}
              style={{
                background: theme === "dark"
                  ? "linear-gradient(135deg, #151515, #1a1a1a)"
                  : "linear-gradient(135deg, #eee, #e0e0e0)",
                borderRadius: RADIUS_CARD[borderRadius],
                color: colors.paragraph,
              }}
            >
              Project {i + 1}
      </div>
        ))}
      </div>
          </div>
    </div>
  );
};

export default GalleryA;
