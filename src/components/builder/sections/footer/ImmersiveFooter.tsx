"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import styles from "./ImmersiveFooter.module.css";
import layout from "../_shared/layout.module.css";

const ImmersiveFooter: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const logo = ct.logo ?? "Brand";
  const tagline = ct.tagline ?? "Work fast. Live slow.";
  const brandName = ct.brandName ?? "Brand";

  const col1Title = ct.col1Title ?? "Menu";
  const col1Links = (typeof ct.col1Links === "string" ? ct.col1Links : "Home, About Us, What We Do, Pricing, Contact Us").split(", ").filter(Boolean);

  const col2Title = ct.col2Title ?? "Socials";
  const col2Links = (typeof ct.col2Links === "string" ? ct.col2Links : "Instagram, X, Facebook, LinkedIn, TikTok").split(", ").filter(Boolean);

  const col3Title = ct.col3Title ?? "Resources";
  const col3Links = (typeof ct.col3Links === "string" ? ct.col3Links : "Blog, Newsletter, Case Studies").split(", ").filter(Boolean);

  const textBright = "rgba(255,255,255,0.9)";
  const textMuted = "rgba(255,255,255,0.6)";
  const dividerColor = "rgba(255,255,255,0.12)";
  const brandFaint = "rgba(255,255,255,0.2)";

  return (
    <footer className={styles.footer}>
      {/* Background */}
      <div className={styles.bgLayer}>
        <div className={styles.bgGradient}
          style={{
            background: `radial-gradient(ellipse 120% 60% at 50% 20%, ${colors.accent}4d 0%, transparent 70%), linear-gradient(180deg, rgba(15, 20, 35, 0.7) 0%, rgba(10, 10, 10, 0.95) 100%)`,
          }}
        />
        <div className={styles.bgOverlay} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={layout.footerInner}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <span className={styles.logoText} style={{ fontFamily: fonts.heading, color: textBright }}>
            {logo}
          </span>
          <span className={styles.topTagline} style={{ fontFamily: fonts.heading, color: textBright}}>
            {tagline}
          </span>
        </div>

        {/* Columns */}
        <div className={styles.columnsRow} style={{ borderTop: `1px solid ${dividerColor}` }}>
          <div className={styles.colGroup}>
            <p className={styles.colTitle} style={{ fontFamily: fonts.heading, color: textBright }}>
              {col1Title}
            </p>
            <div className={styles.colLinks}>
              {col1Links.map((link) => (
                <a key={link} href="#" style={{ fontFamily: fonts.body, color: textMuted }}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.colDivider} style={{ background: dividerColor }} />

          <div className={styles.colGroup}>
            <p className={styles.colTitle} style={{ fontFamily: fonts.heading, color: textBright }}>
              {col2Title}
            </p>
            <div className={styles.colLinks}>
              {col2Links.map((link) => (
                <a key={link} href="#" style={{ fontFamily: fonts.body, color: textMuted }}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.colDivider} style={{ background: dividerColor }} />

          <div className={styles.colGroup}>
            <p className={styles.colTitle} style={{ fontFamily: fonts.heading, color: textBright }}>
              {col3Title}
            </p>
            <div className={styles.colLinks}>
              {col3Links.map((link) => (
                <a key={link} href="#" style={{ fontFamily: fonts.body, color: textMuted }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Giant brand name */}
      <div className={styles.bigNameWrap}>
        <span className={styles.bigName} style={{ fontFamily: fonts.heading, color: brandFaint }}>
          {brandName}
        </span>
      </div>
    </footer>
  );
};

export default ImmersiveFooter;
