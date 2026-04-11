"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, themeBorder, contrastText } from "../_shared/styles";
import styles from "./PricingC.module.css";
import layout from "../_shared/layout.module.css";

const STACK_COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

const PricingC: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const heading = ct.heading ?? "Pricing";
  const subtitle = ct.subtitle ?? "Simple, transparent pricing for every stage of your business.";
  const btnText = ct.btnText ?? "Get Started";

  const plans = [
    {
      label: ct.plan1Label ?? "STARTER",
      name: ct.plan1Name ?? "Website Development",
      price: ct.plan1Price ?? "$2,500",
      desc: ct.plan1Desc ?? "Perfect for businesses looking for a professional online presence.",
      items: (ct.plan1Features ?? "Custom Design, Responsive Layout, SEO Optimized, CMS Integration, 3 Revisions").split(", "),
      stackCount: 3,
    },
    {
      label: ct.plan2Label ?? "PROFESSIONAL",
      name: ct.plan2Name ?? "App Development",
      price: ct.plan2Price ?? "$8,000",
      desc: ct.plan2Desc ?? "Full-scale application development for iOS, Android, or web platforms.",
      items: (ct.plan2Features ?? "Cross-Platform, Custom Backend, User Authentication, Push Notifications, Analytics Dashboard, Ongoing Support").split(", "),
      featured: true,
      stackCount: 5,
    },
    {
      label: ct.plan3Label ?? "ESSENTIAL",
      name: ct.plan3Name ?? "Hosting & Maintenance",
      price: ct.plan3Price ?? "$50/mo",
      desc: ct.plan3Desc ?? "Reliable hosting and ongoing maintenance to keep your product running smoothly.",
      items: (ct.plan3Features ?? "99.9% Uptime, SSL Certificate, Daily Backups, Performance Monitoring").split(", "),
      stackCount: 2,
    },
  ];

  const bg = theme === "dark" ? "#111" : "#f5f5f5";
  const cardBg = theme === "dark" ? "#161616" : "#fff";
  const border = themeBorder(theme);

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={layout.inner}>
        <div className={styles.header}>
          <h2 className={styles.heading} style={{ color: colors.primary, fontFamily: fonts.heading }}>
            {heading}
          </h2>
          <p className={styles.subtitle} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
            {subtitle}
          </p>
        </div>

        <div className={styles.grid}>
          {plans.map((plan) => {
            const isFeatured = !!plan.featured;
            const btnBg = buttonStyle === "filled" ? colors.accent : "transparent";
            const btnColor = buttonStyle === "filled" ? contrastText(colors.accent) : colors.accent;
            const btnBorder = buttonStyle === "outlined" ? `1.5px solid ${colors.accent}` : "none";

            return (
              <div
                key={plan.name}
                className={styles.card}
                style={{
                  background: cardBg,
                  borderRadius: RADIUS_CARD[borderRadius],
                  border: isFeatured ? `1.5px solid ${colors.accent}` : `1px solid ${border}`,
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.planLabel} style={{ color: colors.accent, fontFamily: fonts.heading }}>
                    {plan.label}
                  </div>
                  <div className={styles.price} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                    {plan.price}
                  </div>
                  <div className={styles.planDesc} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                    {plan.desc}
                  </div>
                </div>

                <div className={styles.divider} style={{ background: border }} />

                <div className={styles.stackLabel} style={{ color: colors.paragraph, fontFamily: fonts.heading }}>
                  Tech Stack
                </div>
                <div className={styles.stackRow}>
                  {STACK_COLORS.slice(0, plan.stackCount).map((c, i) => (
                    <div key={i} className={styles.stackDot} style={{ background: c }} />
                  ))}
                </div>

                <div className={styles.featureList}>
                  {plan.items.map((item) => (
                    <div key={item} className={styles.featureItem} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                      <span className={styles.check} style={{ color: colors.accent }}>&#10003;</span>
                      {item}
                    </div>
                  ))}
                </div>

                <div
                  className={styles.btn}
                  style={{
                    borderRadius: RADIUS_CARD[borderRadius],
                    background: isFeatured ? colors.accent : btnBg,
                    color: isFeatured ? contrastText(colors.accent) : btnColor,
                    border: isFeatured ? "none" : btnBorder,
                    fontFamily: fonts.body,
                  }}
                >
                  {btnText}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingC;
