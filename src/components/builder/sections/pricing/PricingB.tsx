"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS_CARD, themeBg, themeBorder, contrastText } from "../_shared/styles";
import styles from "./PricingB.module.css";
import layout from "../_shared/layout.module.css";

const PricingB: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, buttonStyle, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const title = ct.title ?? "Simple, transparent pricing";
  const subtitle = ct.subtitle ?? "No hidden fees. Cancel anytime.";
  const btnText = ct.btnText ?? "Get Started";
  const plans = [
    { name: ct.plan1Name ?? "Basic", price: ct.plan1Price ?? "$29", features: (ct.plan1Features ?? "Up to 3 pages, Mobile responsive, Basic SEO, Email support").split(", ").filter(Boolean) },
    { name: ct.plan2Name ?? "Growth", price: ct.plan2Price ?? "$79", features: (ct.plan2Features ?? "Up to 15 pages, Advanced SEO, Analytics dashboard, Priority support, Custom integrations").split(", ").filter(Boolean), featured: true },
    { name: ct.plan3Name ?? "Scale", price: ct.plan3Price ?? "$149", features: (ct.plan3Features ?? "Unlimited pages, Dedicated account manager, Custom API access, White-label option, SLA guarantee, 24/7 phone support").split(", ").filter(Boolean) },
  ];

  const border = themeBorder(theme);
  const cardBg = theme === "dark" ? "#111" : "#f9f9f9";

  return (
    <div className={styles.section} style={{ background: themeBg(theme) }}>
      <div className={layout.inner}>
        <div className={styles.header}>
          <h2 className={styles.title} style={{ color: colors.primary, fontFamily: fonts.heading }}>
            {title}
          </h2>
          <p className={styles.subtitle} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
            {subtitle}
          </p>
        </div>
        <div className={styles.grid}>
          {plans.map((plan) => {
            const isFeatured = !!plan.featured;
            const btnBg = buttonStyle === "filled" || isFeatured ? colors.accent : "transparent";
            const btnColor = buttonStyle === "filled" || isFeatured ? contrastText(colors.accent) : colors.accent;
            const btnBorder = !isFeatured && buttonStyle === "outlined" ? `1.5px solid ${colors.accent}` : "none";

            return (
              <div
                key={plan.name}
                className={isFeatured ? styles.cardFeatured : styles.card}
                style={{
                  background: isFeatured ? (theme === "dark" ? "#151515" : "#fff") : cardBg,
                  borderRadius: RADIUS_CARD[borderRadius],
                  border: isFeatured ? `1.5px solid ${colors.accent}` : `1px solid ${border}`,
                }}
              >
                {isFeatured && (
                  <div
                    className={styles.badge}
                    style={{
                      background: colors.accent,
                      color: contrastText(colors.accent),
                      borderRadius: RADIUS_CARD[borderRadius],
                      fontFamily: fonts.body,
                    }}
                  >
                    Popular
                  </div>
                )}
                <div className={styles.planName} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                  {plan.name}
                </div>
                <div className={styles.price} style={{ color: colors.primary, fontFamily: fonts.heading }}>
                  {plan.price}
                  <span className={styles.priceUnit} style={{ color: colors.paragraph }}> /mo</span>
                </div>
                <div className={styles.divider} style={{ background: border }} />
                <div className={styles.featureList}>
                  {plan.features.map((f) => (
                    <div key={f} className={styles.featureItem} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                      <span style={{ color: colors.accent }}>&#10003;</span> {f}
                    </div>
                  ))}
                </div>
                <div
                  className={styles.btn}
                  style={{
                    borderRadius: RADIUS_CARD[borderRadius],
                    background: btnBg,
                    color: btnColor,
                    border: btnBorder,
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

export default PricingB;
