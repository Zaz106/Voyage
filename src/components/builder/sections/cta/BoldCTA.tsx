"use client";

import React from "react";
import { useBuilder } from "../../context/BuilderContext";
import { contrastText } from "../_shared/styles";
import styles from "./BoldCTA.module.css";

const BoldCTA: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { globalStyles, sectionContent } = useBuilder();
  const { colors, theme, fonts } = globalStyles;
  const ct = sectionContent[sectionId] ?? {};

  const headingText = ct.heading ?? "STAY IN THE \nLOOP";
  const placeholder = ct.placeholder ?? "Enter your email";
  const btnText = ct.btnText ?? "Subscribe";
  const subtext = ct.subtext ?? "No spam. Unsubscribe anytime.";

  const bg = theme === "dark" ? "#0a0a0a" : "#ffffff";
  const btnBg = colors.accent;
  const btnTextColor = contrastText(colors.accent);
  const inputColor = theme === "dark" ? "rgba(255,255,255,0.8)" : "#333";
  const borderColor = theme === "dark" ? "rgba(255,255,255,0.2)" : "#ccc";
  const subtextColor = theme === "dark" ? "rgba(255,255,255,0.35)" : "#666";

  const lines = headingText.split("\n");

  return (
    <section className={styles.section} style={{ background: bg }}>
      <div className={styles.container}>
        <h2
          className={styles.heading}
          style={{ color: colors.primary, fontFamily: `"${fonts.heading}", sans-serif` }}
        >
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>

        <form
          className={styles.form}
          style={{ borderColor}}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder={placeholder}
            className={styles.input}
            style={{ color: inputColor, fontFamily: `"${fonts.body}", sans-serif` }}
          />
          <button
            type="submit"
            className={styles.button}
            style={{
              background: btnBg,
              color: btnTextColor,
              borderRadius: "9999px",
              fontFamily: `"${fonts.body}", sans-serif`,
            }}
          >
            {btnText}
          </button>
        </form>

        <p
          className={styles.subtext}
          style={{ color: subtextColor, fontFamily: `"${fonts.body}", sans-serif` }}
        >
          {subtext}
        </p>
      </div>
    </section>
  );
};

export default BoldCTA;
