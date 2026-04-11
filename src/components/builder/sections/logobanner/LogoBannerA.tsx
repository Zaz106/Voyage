"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { themeBg, themeBorder } from "../_shared/styles";
import styles from "./LogoBannerA.module.css";
import layout from "../_shared/layout.module.css";

const LogoBannerA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const label = ct.label ?? "Trusted by leading companies";
  const count = 6;

  return (
    <div className={styles.section} style={{ background: themeBg(theme), borderTop: `1px solid ${themeBorder(theme)}`, borderBottom: `1px solid ${themeBorder(theme)}` }}>
      <div className={layout.inner}>
        <p className={styles.label} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
          {label}
        </p>
        <div className={styles.logos}>
          {Array.from({ length: count }).map((_, i) => {
            const name = ct[`logo${i + 1}`] ?? `Company ${i + 1}`;
            return (
              <div key={i} className={styles.logoItem}>
                <div
                  className={styles.logoPill}
                  style={{
                    background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                    color: colors.paragraph,
                    fontFamily: fonts.heading,
                  }}
                >
                  {name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LogoBannerA;
