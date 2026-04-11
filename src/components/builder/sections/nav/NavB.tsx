"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { themeBg } from "../_shared/styles";
import styles from "./NavB.module.css";

const NavB: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const logo = ct.logo ?? "LOGO";
  const links = (ct.links ?? "Home, About, Services, Work, Contact").split(", ").filter(Boolean);

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
            style={{ color: colors.paragraph, fontFamily: fonts.body }}
          >
            {item}
          </span>
        ))}
      </div>
    </nav>
  );
};

export default NavB;
