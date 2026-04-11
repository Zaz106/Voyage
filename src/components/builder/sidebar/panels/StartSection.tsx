"use client";

import React from "react";
import { Shuffle, Sparkles } from "lucide-react";
import { useBuilder } from "../../context/BuilderContext";
import { PRESETS, type StylePreset } from "../../sections/_shared/presets";
import "./StartSection.css";

type StartSectionProps = {
  onRandomize?: () => void;
};

const StartSection: React.FC<StartSectionProps> = ({ onRandomize }) => {
  const { globalStyles, setGlobalStyles } = useBuilder();

  const applyPreset = (preset: StylePreset) => {
    // Use prev.theme inside the updater to avoid stale closure bugs
    setGlobalStyles((prev) => ({
      ...prev,
      colors: { ...(prev.theme === "dark" ? preset.dark : preset.light) },
      fonts: { heading: preset.fonts[0], body: preset.fonts[1] },
      borderRadius: preset.borderRadius,
      buttonStyle: preset.buttonStyle,
      showBadge: preset.showBadge,
      activePresetName: preset.name,
    }));
  };

  return (
    <div className="start-section">
      <div className="start-label">Style Presets</div>
      <div className="presets-grid">
        {PRESETS.map((preset) => {
          const palette =
            globalStyles.theme === "dark" ? preset.dark : preset.light;
          const isActive = globalStyles.activePresetName === preset.name;
          return (
            <div
              key={preset.name}
              className={`preset-card${isActive ? " active" : ""}`}
              onClick={() => applyPreset(preset)}
            >
              {/* 4 colour dots */}
              <div className="preset-dots">
                {[
                  palette.primary,
                  palette.secondary,
                  palette.paragraph,
                  palette.accent,
                ].map((c, i) => (
                  <div
                    key={i}
                    className="preset-dot"
                    style={{ background: c }}
                  />
                ))}
              </div>

              <span className="preset-name">{preset.name}</span>
            </div>
          );
        })}
      </div>

      <div className="start-label" style={{ marginTop: 16 }}>
        Quick Actions
      </div>
      <div className="start-actions">
        <button className="start-action-button" onClick={onRandomize}>
          <Shuffle size={14} />
          Randomize Layout
        </button>
        <button
          className="start-action-button"
          onClick={() => {
            const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
            applyPreset(preset);
          }}
        >
          <Sparkles size={14} />
          Random Style
        </button>
      </div>
    </div>
  );
};

export default StartSection;
