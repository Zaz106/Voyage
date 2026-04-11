"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { themeBg, themeBorder } from "../_shared/styles";
import styles from "./FeatureB.module.css";
import layout from "../_shared/layout.module.css";

const FeatureB: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "How we work";
  const items = [
    { num: "01", title: ct.item1Title ?? "Strategy", desc: ct.item1Desc ?? "We start with deep research to understand your goals and audience." },
    { num: "02", title: ct.item2Title ?? "Design", desc: ct.item2Desc ?? "Pixel-perfect interfaces built with your brand identity in mind." },
    { num: "03", title: ct.item3Title ?? "Development", desc: ct.item3Desc ?? "Clean, performant code that scales with your business." },
    { num: "04", title: ct.item4Title ?? "Launch", desc: ct.item4Desc ?? "We handle deployment, testing and post-launch support." },
  ];

  const border = themeBorder(theme);

  return (
    <div className={styles.section} style={{ background: themeBg(theme) }}>
      <div className={layout.inner}>
        <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {title}
        </h2>
        <div className={styles.list}>
          {items.map((f, i) => (
            <div
              key={f.num}
              className={styles.item}
              style={{
                borderTop: `1px solid ${border}`,
                borderBottom: i === items.length - 1 ? `1px solid ${border}` : "none",
              }}
            >
              <span className={styles.num} style={{ color: colors.accent, fontFamily: fonts.body }}>
                {f.num}
              </span>
              <div>
                <h3 className={styles.itemTitle} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                  {f.title}
                </h3>
                <p className={styles.itemDesc} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                  {f.desc}
                </p>
              </div>
      </div>
        ))}
      </div>
          </div>
    </div>
  );
};

export default FeatureB;
