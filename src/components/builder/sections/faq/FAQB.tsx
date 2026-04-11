"use client";

import React, { useState } from "react";
import { useBuilder } from "../../context/BuilderContext";
import { themeBorder } from "../_shared/styles";
import styles from "./FAQB.module.css";
import layout from "../_shared/layout.module.css";

const FAQB: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "Questions?\nWe\u2019ve got answers.";
  const faqs = [
    { q: ct.q1 ?? "What is included in the free trial?", a: ct.a1 ?? "Full access to all features for 14 days. No credit card required." },
    { q: ct.q2 ?? "Can I cancel at any time?", a: ct.a2 ?? "Absolutely. There are no long-term contracts and you can cancel with one click." },
    { q: ct.q3 ?? "Do you offer custom plans?", a: ct.a3 ?? "Yes \u2014 for teams of 10+ we can create a bespoke package tailored to your needs." },
    { q: ct.q4 ?? "How do I migrate my existing site?", a: ct.a4 ?? "Our onboarding team will handle the full migration at no extra cost." },
    { q: ct.q5 ?? "Is there a setup fee?", a: ct.a5 ?? "No setup fees on any plan. You only pay the monthly or annual subscription." },
  ];

  const bg = theme === "dark" ? "#111" : "#f5f5f5";
  const border = themeBorder(theme);

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={layout.inner}>
        <div className={styles.layout}>
          <div className={styles.heading}>
            <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
              {title}
            </h2>
          </div>
          <div className={styles.accordion}>
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={faq.q} style={{ borderBottom: `1px solid ${border}` }}>
                  <div
                    className={styles.itemHeader}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span className={styles.question} style={{ color: colors.primary, fontFamily: fonts.body }}>
                      {faq.q}
                    </span>
                    <span
                      className={styles.toggle}
                      style={{
                        color: colors.paragraph,
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      +
                    </span>
                  </div>
                  <div
                    className={styles.answerWrap}
                    style={{ maxHeight: isOpen ? 200 : 0 }}
                  >
                    <p className={styles.answer} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQB;
