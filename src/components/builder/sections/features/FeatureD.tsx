"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import styles from "./FeatureD.module.css";

const FeatureSection: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const heading = ct.heading ?? "Tailored Solutions For\nYour Needs";
  const subtitle =
    ct.subtitle ??
    "From client-ready app interfaces to user-friendly websites, our team is focused on delivering excellence.";
  const badge = ct.badge ?? "Services";

  const services = [
    {
      title: ct.svc1Title ?? "Mobile & Website Design",
      desc: ct.svc1Desc ?? "We design beautiful, conversion-focused interfaces for every screen. Each layout is built for clarity, branding alignment and a seamless user journey.",
    },
    {
      title: ct.svc2Title ?? "Website Development",
      desc: ct.svc2Desc ?? "We develop fast, responsive web applications leveraging modern frameworks to deliver maintainable, scalable code.",
    },
    {
      title: ct.svc3Title ?? "Brand Guideline",
      desc: ct.svc3Desc ?? "We craft detailed brand guidelines that give you a consistent, professional identity across every touchpoint.",
    },
    {
      title: ct.svc4Title ?? "Product Design",
      desc: ct.svc4Desc ?? "From concept to finished product, we design purposeful digital tools that solve real problems for your users.",
    },
  ];

  const isDark = theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#fff";
  const headingColor = colors.primary;
  const textColor = colors.paragraph;
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const badgeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const showBadge = globalStyles.showBadge;

  return (
    <div className={styles.section} style={{ background: bg }}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          {showBadge && (
            <div
              className={styles.badge}
              style={{ background: badgeBg, color: colors.accent, fontFamily: fonts.body }}
            >
              <span className={styles.badgeDot} style={{ background: colors.accent }} />
              {badge}
            </div>
          )}
          <h2
            className={styles.heading}
            style={{ color: headingColor, fontFamily: fonts.heading, whiteSpace: "pre-line" }}
          >
            {heading}
          </h2>
          <p className={styles.subtitle} style={{ color: textColor, fontFamily: fonts.body }}>
            {subtitle}
          </p>
        </div>

        {/* Service rows */}
        <div className={styles.list}>
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className={styles.row}
              style={{
                borderTop: `1px solid ${border}`,
                borderBottom: i === services.length - 1 ? `1px solid ${border}` : "none",
              }}
            >
              <h3
                className={styles.serviceTitle}
                style={{ color: headingColor, fontFamily: fonts.heading }}
              >
                {svc.title}
              </h3>
              <p className={styles.serviceDesc} style={{ color: textColor, fontFamily: fonts.body }}>
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
