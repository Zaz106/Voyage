"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, themeBg, themeBorder } from "../_shared/styles";
import styles from "./FAQA.module.css";
import layout from "../_shared/layout.module.css";

const FAQA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "Frequently Asked Questions";
  const faqs = [
    { q: ct.q1 ?? "How do I get started?", a: ct.a1 ?? "Sign up for a free account and choose a template to begin building your website." },
    { q: ct.q2 ?? "Can I use my own domain?", a: ct.a2 ?? "Yes, all Pro and Enterprise plans include custom domain support." },
    { q: ct.q3 ?? "Is there a free trial?", a: ct.a3 ?? "We offer a 14-day free trial on all paid plans, no credit card required." },
    { q: ct.q4 ?? "Do you offer refunds?", a: ct.a4 ?? "Yes, we have a 30-day money-back guarantee on all plans." },
  ];

  const cardBg = theme === "dark" ? "#141414" : "#f9f9f9";

  return (
    <div className={styles.section} style={{ background: themeBg(theme) }}>
      <div className={layout.inner}>
        <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {title}
        </h2>
        <div className={styles.list}>
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className={styles.card}
              style={{
                background: cardBg,
                borderRadius: RADIUS_CARD[borderRadius],
                border: `1px solid ${themeBorder(theme)}`,
              }}
            >
              <div className={styles.question} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                {faq.q}
              </div>
              <div className={styles.answer} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                {faq.a}
              </div>
      </div>
        ))}
      </div>
          </div>
    </div>
  );
};

export default FAQA;
