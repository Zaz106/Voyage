"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import styles from "./BigNameFooter.module.css";
import layout from "../_shared/layout.module.css";

const BigNameFooter: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const logo = ct.logo ?? "Brand";
  const tagline = ct.tagline ?? "Building the future of the web, one pixel at a time.";
  const copyright = ct.copyright ?? `© ${new Date().getFullYear()} Brand. All rights reserved.`;

  const col1Title = ct.col1Title ?? "Pages";
  const col1Links = (typeof ct.col1Links === "string" ? ct.col1Links : "Home, About Us, What We Do, Pricing, Contact Us").split(", ").filter(Boolean);
  const col2Title = ct.col2Title ?? "Company";
  const col2Links = (typeof ct.col2Links === "string" ? ct.col2Links : "Blog, Careers, Press, Contact Us").split(", ").filter(Boolean);

  const socialIcons: { name: string; path: string }[] = [
    {
      name: "Instagram",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    },
    {
      name: "X",
      path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.751-8.862L1.813 2.25h7.01l4.261 5.636 5.16-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
    {
      name: "Facebook",
      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
      name: "LinkedIn",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      name: "TikTok",
      path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    },
  ];

  const isDark = theme === "dark";
  const bg = isDark ? "#0d0d0d" : "#f0f0f0";
  const textStrong = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
  const textMuted = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const textFaint = isDark ? "rgba(255,255,255,0.065)" : "rgba(0,0,0,0.065)";

  return (
    <footer className={styles.footer} style={{ backgroundColor: bg }}>
      <div className={layout.footerInner}>
      {/* Top row */}
      <div className={styles.top}>
        {/* Logo + tagline + socials */}
        <div className={styles.brand}>
          <span className={styles.logoText} style={{ fontFamily: fonts.heading, color: textStrong }}>
            {logo}
          </span>
          <p className={styles.tagline} style={{ fontFamily: fonts.body, color: textMuted }}>
            {tagline}
          </p>
          <div className={styles.socialRow}>
            {socialIcons.map(({ name, path }) => (
              <a key={name} href="#" aria-label={name} className={styles.socialIcon} style={{ color: textMuted }}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        <div className={styles.navColumns}>
          <div className={styles.navCol}>
            <p className={styles.colTitle} style={{ fontFamily: fonts.heading, color: textMuted }}>
              {col1Title}
            </p>
            {col1Links.map((link) => (
              <a key={link} href="#" className={styles.navLink} style={{ fontFamily: fonts.body, color: textStrong }}>
                {link}
              </a>
            ))}
          </div>
          <div className={styles.navCol}>
            <p className={styles.colTitle} style={{ fontFamily: fonts.heading, color: textMuted }}>
              {col2Title}
            </p>
            {col2Links.map((link) => (
              <a key={link} href="#" className={styles.navLink} style={{ fontFamily: fonts.body, color: textStrong }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      </div>
      {/* Fading brand name */}
      <div className={styles.bigNameWrap}>
        <span
          className={styles.bigName}
          style={{
            fontFamily: fonts.heading,
            color: textFaint,
          }}
        >
          {logo}
        </span>
        <p className={styles.copyright} style={{ fontFamily: fonts.body, color: textMuted }}>
          {copyright}
        </p>
      </div>
    </footer>
  );
};

export default BigNameFooter;
