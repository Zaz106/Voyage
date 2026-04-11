"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { RADIUS, themeBg, themeMutedText, contrastText } from "../_shared/styles";
import styles from "./NavA.module.css";

const NavA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, borderRadius, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const logo = ct.logo ?? "Logo";
  const links = (ct.links ?? "Home, About, Work, Contact").split(", ").filter(Boolean);
  const ctaText = ct.ctaText ?? "Get Started";

  return (
    <nav className={styles.nav} style={{ background: themeBg(theme) }}>
      <div className={styles.logo} style={{ color: colors.primary, fontFamily: fonts.heading }}>
        {logo}
      </div>
      <div className={styles.links}>
        {links.map((item) => (
          <span
            key={item}
            className={styles.link}
            style={{ color: themeMutedText(theme), fontFamily: fonts.body }}
          >
            {item}
          </span>
        ))}
      </div>
      <div
        className={styles.cta}
        style={{
          borderRadius: RADIUS[borderRadius],
          background: colors.accent,
          color: contrastText(colors.accent),
          fontFamily: fonts.body,
        }}
      >
        {ctaText}
      </div>
    </nav>
  );
};

export default NavA;
