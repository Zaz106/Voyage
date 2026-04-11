"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, themeBg, themeBorder } from "../_shared/styles";
import styles from "./TestimonialsB.module.css";
import layout from "../_shared/layout.module.css";

const TestimonialsB: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "Client Stories";
  const testimonials = [
    { name: ct.author1 ?? "Maria Reynolds", role: ct.role1 ?? "CEO, Vortex Labs", quote: ct.quote1 ?? "They delivered beyond our expectations. The attention to craft is unmatched.", rating: 5 },
    { name: ct.author2 ?? "Tom Bradley", role: ct.role2 ?? "Head of Product, Arc", quote: ct.quote2 ?? "Working with this team felt like having an in-house design department.", rating: 5 },
  ];

  const cardBg = theme === "dark" ? "#111" : "#f8f8f8";

  return (
    <div className={styles.section} style={{ background: themeBg(theme) }}>
      <div className={layout.inner}>
        <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {title}
        </h2>
        <div className={styles.list}>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className={styles.card}
              style={{
                background: cardBg,
                borderRadius: RADIUS_CARD[borderRadius],
                border: `1px solid ${themeBorder(theme)}`,
              }}
            >
              <div className={styles.stars}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className={styles.star} style={{ color: colors.accent }}>
                    &#9733;
                  </span>
                ))}
              </div>
              <p className={styles.quote} style={{ color: colors.primary, fontFamily: fonts.body }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className={styles.author}>
                <div
                  className={styles.avatar}
                  style={{
                    background: theme === "dark" ? "#222" : "#ddd",
                    color: colors.primary,
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className={styles.authorName} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                    {t.name}
                  </div>
                  <div className={styles.authorRole} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                    {t.role}
                  </div>
                </div>
              </div>
      </div>
        ))}
      </div>
          </div>
    </div>
  );
};

export default TestimonialsB;
