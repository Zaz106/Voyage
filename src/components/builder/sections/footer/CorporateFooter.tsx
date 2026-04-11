"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import styles from "./CorporateFooter.module.css";
import layout from "../_shared/layout.module.css";

const CorporateFooter: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const logo = ct.logo ?? "Brand";
  const tagline =
    ct.tagline ??
    "Building scalable digital experiences for modern businesses \u2014 designed with purpose, built with precision.";
  const copyright = ct.copyright ?? `\u00a9 ${new Date().getFullYear()} Brand. All rights reserved`;

  const col1Title = ct.col1Title ?? "Pages";
  const col1Links = (typeof ct.col1Links === "string" ? ct.col1Links : "Home, About Us, What We Do, Pricing, Contact Us").split(", ").filter(Boolean);
  const col2Title = ct.col2Title ?? "Resources";
  const col2Links = (typeof ct.col2Links === "string" ? ct.col2Links : "Blog, Case Studies, Newsletter, Documentation").split(", ").filter(Boolean);
  const col3Title = ct.col3Title ?? "Company";
  const col3Links = (typeof ct.col3Links === "string" ? ct.col3Links : "About Us, Careers, Press, Partners").split(", ").filter(Boolean);

  const legal1 = ct.legal1 ?? "Terms of Service";
  const legal2 = ct.legal2 ?? "Privacy Policy";

  const isDark = theme === "dark";
  const bg = isDark ? "#0d0d0d" : "#f5f5f5";
  const textStrong = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const textFaint = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <footer className={styles.footer} style={{ backgroundColor: bg }}>
      <div className={layout.footerInner}>
      {/* Top section */}
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.logoText} style={{ fontFamily: fonts.heading, color: textStrong }}>
            {logo}
          </span>
          <p className={styles.tagline} style={{ fontFamily: fonts.body, color: textMuted }}>
            {tagline}
          </p>
        </div>

        <div className={styles.navColumns}>
          {[
            { title: col1Title, links: col1Links },
            { title: col2Title, links: col2Links },
            { title: col3Title, links: col3Links },
          ].map((col) => (
            <div key={col.title} className={styles.navCol}>
              <p className={styles.colTitle} style={{ fontFamily: fonts.heading, color: textStrong }}>
                {col.title}
              </p>
              {col.links.map((link) => (
                <a key={link} href="#" className={styles.navLink} style={{ fontFamily: fonts.body, color: textMuted }}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar} style={{ borderTop: `1px solid ${border}` }}>
        <p className={styles.copyright} style={{ fontFamily: fonts.body, color: textMuted }}>
          {copyright}
        </p>
        <div className={styles.legalLinks}>
          <a href="#" style={{ fontFamily: fonts.body, color: textMuted }}>{legal1}</a>
          <a href="#" style={{ fontFamily: fonts.body, color: textMuted }}>{legal2}</a>
        </div>
      </div>

      </div>
      {/* Giant faded brand name */}
      <div className={styles.bigNameWrap}>
        <span className={styles.bigName} style={{ fontFamily: fonts.heading, color: textFaint }}>
          {logo}
        </span>
      </div>
    </footer>
  );
};

export default CorporateFooter;
