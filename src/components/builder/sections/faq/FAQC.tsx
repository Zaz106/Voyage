"use client";

import React, { useState } from "react";
import { useBuilder } from "../../context/BuilderContext";
import { themeBorder } from "../_shared/styles";
import styles from "./FAQC.module.css";
import layout from "../_shared/layout.module.css";

const FAQC: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ct = sectionContent[sectionId] ?? {};

  const heading = ct.heading ?? "Frequently Asked Questions";
  const subtitle = ct.subtitle ?? "Everything you need to know about working with us.";

  const faqs = [
    { q: ct.q1 ?? "What services do you offer?", a: ct.a1 ?? "We specialize in building custom web applications, mobile apps, and robust backend systems tailored to scale with your business." },
    { q: ct.q2 ?? "How long does a typical project take?", a: ct.a2 ?? "Project timelines vary depending on complexity. A standard website might take 4-6 weeks, while complex applications can take 3-6 months." },
    { q: ct.q3 ?? "What is your typical tech stack?", a: ct.a3 ?? "We primarily work with Next.js, TypeScript, and Node.js for scalability, though we choose the best tools for each project." },
    { q: ct.q4 ?? "Do you offer ongoing maintenance and support?", a: ct.a4 ?? "Yes, we provide flexible support and hosting plans to ensure your digital products stay secure, up-to-date, and high-performing." },
    { q: ct.q5 ?? "Can you help with app store submissions?", a: ct.a5 ?? "Absolutely. We handle the entire deployment process, including Apple App Store and Google Play Store submissions." },
    { q: ct.q6 ?? "How do you handle project security?", a: ct.a6 ?? "Security is built into our architecture from day one. We follow industry best practices for data encryption and secure authentication." },
  ];

  const bg = theme === "dark" ? "#111" : "#f5f5f5";
  const border = themeBorder(theme);

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={layout.inner}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.heading} style={{ color: colors.primary, fontFamily: fonts.heading }}>
              {heading}
            </h2>
            <p className={styles.subtitle} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
              {subtitle}
            </p>
          </div>

          <div className={styles.list}>
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className={`${styles.item} ${activeIndex === i ? styles.active : ""}`}
                style={{ borderBottomColor: border }}
              >
                <button
                  className={styles.question}
                  style={{ color: colors.primary, fontFamily: fonts.body }}
                  onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className={styles.plusIcon} style={{ color: colors.paragraph }}>+</span>
                </button>
                <div className={styles.answerWrap}>
                  <p className={styles.answer} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQC;
