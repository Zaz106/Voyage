"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, themeBorder, contrastText } from "../_shared/styles";
import styles from "./PricingA.module.css";
import layout from "../_shared/layout.module.css";

const PricingA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "Pricing";
  const btnText = ct.btnText ?? "Get Started";
  const plans = [
    { name: ct.plan1Name ?? "Starter", price: ct.plan1Price ?? "$19", desc: ct.plan1Desc ?? "Perfect for personal projects", items: (ct.plan1Features ?? "1 Website, Basic Analytics, Email Support").split(", ") },
    { name: ct.plan2Name ?? "Pro", price: ct.plan2Price ?? "$49", desc: ct.plan2Desc ?? "For growing businesses", items: (ct.plan2Features ?? "5 Websites, Advanced Analytics, Priority Support, Custom Domain").split(", "), featured: true },
    { name: ct.plan3Name ?? "Enterprise", price: ct.plan3Price ?? "$99", desc: ct.plan3Desc ?? "For teams at scale", items: (ct.plan3Features ?? "Unlimited Websites, Full Analytics, Dedicated Manager, SLA Guarantee").split(", ") },
  ];

  const bg = theme === "dark" ? "#111" : "#f5f5f5";
  const cardBg = theme === "dark" ? "#161616" : "#fff";
  const border = themeBorder(theme);

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={layout.inner}>
        <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
          {title}
        </h2>
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
                <div className={styles.planName} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                  {plan.name}
                </div>
                <div className={styles.price} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                  {plan.price}
                  <span className={styles.priceUnit} style={{ color: colors.paragraph }}>/mo</span>
                </div>
                <div className={styles.planDesc} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                  {plan.desc}
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

export default PricingA;
