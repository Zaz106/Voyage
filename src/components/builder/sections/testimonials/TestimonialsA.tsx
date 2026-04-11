"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, themeCardBg, themeBorder } from "../_shared/styles";
import styles from "./TestimonialsA.module.css";
import layout from "../_shared/layout.module.css";

const TestimonialsA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "What people are saying";
  const testimonials = [
    { name: ct.author1 ?? "Alex Chen", role: ct.role1 ?? "Founder, Pixel Co", quote: ct.quote1 ?? "This builder completely transformed how we approach our web presence." },
    { name: ct.author2 ?? "Sarah Kim", role: ct.role2 ?? "Designer, Studio M", quote: ct.quote2 ?? "The attention to detail is remarkable. Best tool I\u2019ve used in years." },
    { name: ct.author3 ?? "James Okoro", role: ct.role3 ?? "CTO, Launchpad", quote: ct.quote3 ?? "Saved our team weeks of development time. Absolutely worth it." },
  ];

  const bg = theme === "dark" ? "#111" : "#f5f5f5";

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={layout.inner}>
        <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {title}
        </h2>
        <div className={styles.grid}>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className={styles.card}
              style={{
                background: themeCardBg(theme),
                borderRadius: RADIUS_CARD[borderRadius],
                border: `1px solid ${themeBorder(theme)}`,
              }}
            >
              <p className={styles.quote} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <div className={styles.authorName} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                  {t.name}
                </div>
                <div className={styles.authorRole} style={{ color: colors.secondary, fontFamily: fonts.body }}>
                  {t.role}
                </div>
              </div>
      </div>
        ))}
      </div>
          </div>
    </div>
  );
};

export default TestimonialsA;
