"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import styles from "./TestimonialsC.module.css";

const TestimonialsSection: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const badge = ct.badge ?? "Testimonials";
  const title = ct.title ?? "What Fast-Growing Teams\nSay About Us";

  const testimonials = [
    {
      name: ct.author1 ?? "Brennan Burke",
      role: ct.role1 ?? "CEO, Hyperspell",
      quote: ct.quote1 ?? "Is The First Product I've Seen That Customers The Demo Experience They Demand. This Is What Modern GTM Looks Like.",
    },
    {
      name: ct.author2 ?? "Han Gu",
      role: ct.role2 ?? "Co-Founder & CTO, Palate Insights",
      quote: ct.quote2 ?? "Hobbes Dramatically Speeds Up Our Process By Getting To A Demo Immediately. It's Far More Engaging And Relevant Than Scrolling Through A Website.",
    },
    {
      name: ct.author3 ?? "Joseph Helmy",
      role: ct.role3 ?? "Founder & CEO, Haukvard",
      quote: ct.quote3 ?? "Hobbes Materially Accelerates And Strengthens Our Sales Process To Deliver Deep Personal Demos To Those Who May Not Be Ready To Talk.",
    },
    {
      name: ct.author4 ?? "Lena Torres",
      role: ct.role4 ?? "VP Product, Astra Labs",
      quote: ct.quote4 ?? "We replaced three tools with one. The workflow improvement alone paid for itself within the first month of onboarding.",
    },
    {
      name: ct.author5 ?? "Marcus Reid",
      role: ct.role5 ?? "Head of Growth, Nomad",
      quote: ct.quote5 ?? "Our conversion rate jumped 40% after switching. The product just understands what modern teams need to move quickly.",
    },
  ];

  const isDark = theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#fafafa";
  const cardBg = isDark ? "#151515" : "#fff";
  const headingColor = colors.primary;
  const textColor = colors.paragraph;
  const mutedColor = colors.secondary;
  const badgeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const avatarBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  // Duplicate cards for seamless infinite loop
  const cards = [...testimonials, ...testimonials];

  return (
    <div className={styles.section} style={{ background: bg }}>
      {/* Header */}
      <div className={styles.header}>
        {globalStyles.showBadge && (
          <div
            className={styles.badge}
            style={{ background: badgeBg, color: colors.accent, fontFamily: fonts.body }}
          >
            <span className={styles.badgeDot} style={{ background: colors.accent }} />
            {badge}
          </div>
        )}
        <h2
          className={styles.title}
          style={{ color: headingColor, fontFamily: fonts.heading, whiteSpace: "pre-line" }}
        >
          {title}
        </h2>
      </div>

      {/* Carousel */}
      <div className={styles.track}>
        {cards.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className={styles.card}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <div>
              <div className={styles.quoteIcon} style={{ color: headingColor }}>&ldquo;</div>
              <p className={styles.quoteText} style={{ color: textColor, fontFamily: fonts.body }}>
                {t.quote}
              </p>
            </div>

            <div className={styles.author}>
              <div
                className={styles.avatar}
                style={{ background: avatarBg, color: headingColor, fontFamily: fonts.heading }}
              >
                {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className={styles.authorName} style={{ color: headingColor, fontFamily: fonts.heading }}>
                  {t.name}
                </div>
                <div className={styles.authorRole} style={{ color: mutedColor, fontFamily: fonts.body }}>
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
