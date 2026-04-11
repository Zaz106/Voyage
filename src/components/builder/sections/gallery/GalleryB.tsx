"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD } from "../_shared/styles";
import styles from "./GalleryB.module.css";
import layout from "../_shared/layout.module.css";

const GalleryB: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "Selected Work";
  const projects = [
    { title: ct.item1Title ?? "Brand Refresh", category: ct.item1Cat ?? "Branding" },
    { title: ct.item2Title ?? "Mobile App", category: ct.item2Cat ?? "Development" },
    { title: ct.item3Title ?? "E-Commerce", category: ct.item3Cat ?? "Web Design" },
    { title: ct.item4Title ?? "Dashboard", category: ct.item4Cat ?? "UI/UX" },
  ];

  const bg = theme === "dark" ? "#111" : "#f5f5f5";

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={layout.inner}>
        <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {title}
        </h2>
        <div className={styles.grid}>
          {projects.map((p, i) => (
            <div
              key={p.title}
              className={styles.item}
              style={{
                aspectRatio: i % 3 === 0 ? "16/10" : "4/3",
                background: theme === "dark"
                  ? "linear-gradient(135deg, #1a1a1a, #222)"
                  : "linear-gradient(135deg, #e8e8e8, #ddd)",
                borderRadius: RADIUS_CARD[borderRadius],
              }}
            >
              <div>
                <div className={styles.category} style={{ color: colors.accent, fontFamily: fonts.body }}>
                  {p.category}
                </div>
                <div className={styles.itemTitle} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                  {p.title}
                </div>
              </div>
      </div>
        ))}
      </div>
          </div>
    </div>
  );
};

export default GalleryB;
