"use client";

import React, { useState, useRef, useEffect } from "react";
import { SquarePen } from "lucide-react";
import ColorPickerPopup from "../widgets/ColorPickerPopup";
import { useBuilder, PaletteColors } from "../../context/BuilderContext";
import { PRESETS } from "../../sections/_shared/presets";
import "./GlobalStylesSection.css";

interface GlobalStylesSectionProps {
  activeConfigId: string | null;
  setActiveConfigId: (id: string | null) => void;
}

const PALETTE_KEYS: { key: keyof PaletteColors; label: string }[] = [
  { key: "primary", label: "Headings" },
  { key: "secondary", label: "Sub-Headings" },
  { key: "paragraph", label: "Paragraphs" },
  { key: "accent", label: "Accent" },
];

const GlobalStylesSection: React.FC<GlobalStylesSectionProps> = ({
  activeConfigId,
  setActiveConfigId,
}) => {
  const { globalStyles, setGlobalStyles } = useBuilder();
  const { colors, borderRadius, buttonStyle, theme } = globalStyles;

  const [activeColorKey, setActiveColorKey] = useState<keyof PaletteColors | null>(null);
  const [colorPickerAnchorRect, setColorPickerAnchorRect] = useState<DOMRect | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close color picker when secondary sidebar opens
  React.useEffect(() => {
    if (activeConfigId) {
      setActiveColorKey(null);
      setColorPickerAnchorRect(null);
    }
  }, [activeConfigId]);

  // Close color picker on outside click — same pattern as dropdown menus
  useEffect(() => {
    if (!activeColorKey) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".palette-swatch")) return;
      if (colorPickerRef.current && colorPickerRef.current.contains(target)) return;
      setActiveColorKey(null);
      setColorPickerAnchorRect(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [activeColorKey]);

  const handleSwatchClick = (
    key: keyof PaletteColors,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (activeColorKey === key) {
      setActiveColorKey(null);
      setColorPickerAnchorRect(null);
    } else {
      // Close secondary sidebar when opening color picker
      if (activeConfigId) setActiveConfigId(null);
      setActiveColorKey(key);
      setColorPickerAnchorRect(e.currentTarget.getBoundingClientRect());
    }
  };

  const handleFontPairingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveConfigId(activeConfigId === "font-pairing" ? null : "font-pairing");
  };

  return (
    <>
      <div className="global-style-container">
        {/* Color Palette */}
        <div className="style-section">
          <div className="global-style-label">Color Palette</div>
          {PALETTE_KEYS.map(({ key, label }) => (
            <div className="palette-row" key={key}>
              <span className="palette-label">{label}</span>
              <div
                className="palette-swatch"
                style={{
                  background: colors[key],
                  outline:
                    activeColorKey === key
                      ? "1.5px solid rgba(255,255,255,0.2)"
                      : "none",
                  outlineOffset: 2,
                }}
                data-prevent-outside-close="true"
                onClick={(e) => handleSwatchClick(key, e)}
              />
            </div>
          ))}
        </div>

        {/* Font Pairings */}
        <div className="style-section">
          <div className="global-style-label">Font Pairings</div>
          <div
            className="font-pairing-preview"
            data-prevent-outside-close="true"
            onClick={handleFontPairingClick}
            style={{ justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="font-primary">{globalStyles.fonts.heading}</span>
              <span className="font-divider">/</span>
              <span className="font-secondary">{globalStyles.fonts.body}</span>
            </div>
            <SquarePen
              size={13}
              color={
                activeConfigId === "font-pairing"
                  ? "rgba(255,255,255,0.6)"
                  : "#555"
              }
              style={{ cursor: "pointer", flexShrink: 0 }}
            />
          </div>
        </div>

        {/* Border Radius */}
        <div className="style-section">
          <div className="global-style-label">Border Radius</div>
          <div className="checkbox-list">
            {(
              [
                { id: "sharp" as const, label: "Sharp" },
                { id: "soft" as const, label: "Soft" },
                { id: "rounded" as const, label: "Rounded" },
              ] as const
            ).map(({ id, label }) => (
              <div
                key={id}
                className="checkbox-row"
                onClick={() => setGlobalStyles((prev) => ({ ...prev, borderRadius: id }))}
                style={{ cursor: "pointer" }}
              >
                <span>{label}</span>
                <div className={`custom-checkbox ${borderRadius === id ? "checked" : ""}`}>
                  {borderRadius === id && <div className="checkbox-inner" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button Style */}
        <div className="style-section">
          <div className="global-style-label">Button Style</div>
          <div className="segmented-control">
            {(["filled", "outlined"] as const).map((opt) => (
              <div
                key={opt}
                className={`segment-option ${buttonStyle === opt ? "active" : ""}`}
                onClick={() => setGlobalStyles((prev) => ({ ...prev, buttonStyle: opt }))}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Section Badge */}
        <div className="style-section">
          <div className="global-style-label">Section Badge</div>
          <div className="segmented-control">
            {([true, false] as const).map((val) => (
              <div
                key={String(val)}
                className={`segment-option ${globalStyles.showBadge === val ? "active" : ""}`}
                onClick={() => setGlobalStyles((prev) => ({ ...prev, showBadge: val }))}
              >
                {val ? "Show" : "Hide"}
              </div>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="style-section">
          <div className="global-style-label">Theme</div>
          <div className="segmented-control">
            {(["light", "dark"] as const).map((opt) => (
              <div
                key={opt}
                className={`segment-option ${globalStyles.theme === opt ? "active" : ""}`}
                onClick={() =>
                  setGlobalStyles((prev) => {
                    const next = { ...prev, theme: opt };
                    // Re-apply the active preset's colour palette for the new theme
                    if (prev.activePresetName) {
                      const preset = PRESETS.find((p) => p.name === prev.activePresetName);
                      if (preset) next.colors = { ...preset[opt] };
                    }
                    return next;
                  })
                }
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Picker Popup — rendered at root level via portal-like fixed positioning */}
      {activeColorKey && colorPickerAnchorRect && (
        <div ref={colorPickerRef}>
          <ColorPickerPopup
          color={colors[activeColorKey]}
          anchorRect={colorPickerAnchorRect}
          onChange={(hex) =>
            setGlobalStyles((prev) => ({
              ...prev,
              colors: { ...prev.colors, [activeColorKey]: hex },
            }))
          }
          onClose={() => {
            setActiveColorKey(null);
            setColorPickerAnchorRect(null);
          }}
        />
        </div>
      )}
    </>
  );
};

export default GlobalStylesSection;
