"use client";

import React from "react";
import Link from "next/link";
import { useBuilder } from "../../context/BuilderContext";
import { contrastText } from "../_shared/styles";
import styles from "./SpinnyFooter.module.css";

const SpinnyFooter: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, fonts } = globalStyles;
  const content = sectionContent[sectionId] ?? {};

  const navItems = content.navItems 
    ? (Array.isArray(content.navItems) ? content.navItems : (content.navItems as string).split(', ').map(name => ({ name, href: "#" })))
    : [
        { name: "HOME", href: "/" },
        { name: "ABOUT US", href: "#" },
        { name: "PROJECTS", href: "#" },
        { name: "NEWS/BLOG", href: "#" },
        { name: "SHOP", href: "#" },
        { name: "FAQ", href: "#" },
        { name: "CONTACT US", href: "#" },
      ];

  const copyright = content.copyright ?? "Copyright \u00a9 2026 Business Name. All rights reserved.";
  const legalText = content.legalText ?? "THE LEGAL STUFF";
  const textColor = contrastText(colors.accent);

  return (
    <footer className={styles.footer} style={{ backgroundColor: colors.accent, color: textColor }}>
      <div className={styles.carouselContainer}>
        <nav className={styles.nav}>
          <div className={styles.navTrack}>
            {/* First set */}
            {navItems.map((item: any, index: number) => (
              <a key={`set1-${index}`} href={item.href} style={{ fontFamily: fonts.heading, color: textColor }}>
                {item.name}
              </a>
            ))}
            {/* Duplicate set for seamless loop */}
            {navItems.map((item: any, index: number) => (
              <a key={`set2-${index}`} href={item.href} style={{ fontFamily: fonts.heading, color: textColor }}>
                {item.name}
              </a>
            ))}
          </div>
        </nav>
      </div>
      <div className={styles.copy} style={{ fontFamily: fonts.body }}>
        {copyright}
      </div>
      <a href="#" className={styles.legal} style={{ fontFamily: fonts.heading, color: textColor }}>
        {legalText}
      </a>
    </footer>
  );
};

export default SpinnyFooter;
