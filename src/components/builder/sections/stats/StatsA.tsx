"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { themeBg, themeBorder } from "../_shared/styles";
import styles from "./StatsA.module.css";
import layout from "../_shared/layout.module.css";

const StatsA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const label = ct.label ?? "Trusted by teams worldwide";
  const stats = [
    { value: ct.stat1Value ?? "500+", label: ct.stat1Label ?? "Happy Clients" },
    { value: ct.stat2Value ?? "99.9%", label: ct.stat2Label ?? "Uptime SLA" },
    { value: ct.stat3Value ?? "2M+", label: ct.stat3Label ?? "Requests / Day" },
    { value: ct.stat4Value ?? "24/7", label: ct.stat4Label ?? "Support" },
  ];

  return (
    <div className={styles.section} style={{ background: themeBg(theme), borderTop: `1px solid ${themeBorder(theme)}`, borderBottom: `1px solid ${themeBorder(theme)}` }}>
      <div className={layout.inner}>
        {label && (
          <p className={styles.label} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
            {label}
          </p>
        )}
        <div className={styles.grid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.value} style={{ color: colors.accent, fontFamily: fonts.heading }}>
                {s.value}
              </span>
              <span className={styles.statLabel} style={{ color: colors.paragraph, fontFamily: fonts.body }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsA;
