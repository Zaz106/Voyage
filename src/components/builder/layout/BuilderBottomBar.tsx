"use client";

import React from "react";
import { Sparkles, Layers, Palette, Type, RotateCcw } from "lucide-react";
import { ToolSection } from "../sidebar/types";
import "./BuilderBottomBar.css";

interface BuilderBottomBarProps {
  activeToolSection: ToolSection | null;
  onSelectSection: (section: ToolSection) => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomPercent: number;
}

const TOOL_SECTIONS: { id: ToolSection; label: string; icon: React.ReactNode }[] = [
  { id: "start", label: "Start", icon: <Sparkles size={15} /> },
  { id: "sections", label: "Sections", icon: <Layers size={15} /> },
  { id: "global", label: "Style", icon: <Palette size={15} /> },
  { id: "content", label: "Content", icon: <Type size={15} /> },
];

const BuilderBottomBar: React.FC<BuilderBottomBarProps> = ({
  activeToolSection,
  onSelectSection,
  onResetView,
  onZoomIn,
  onZoomOut,
  zoomPercent,
}) => (
  <div className="builder-bottom-bar">
    {TOOL_SECTIONS.map((s) => (
      <button
        key={s.id}
        className={`bbar-btn${activeToolSection === s.id ? " active" : ""}`}
        onClick={() => onSelectSection(s.id)}
      >
        {s.icon}
        <span className="bbar-label">{s.label}</span>
      </button>
    ))}

    <div className="bbar-divider" />

    <button className="bbar-btn" onClick={onResetView} aria-label="Reset view">
      <RotateCcw size={14} />
    </button>
    <button className="bbar-btn" onClick={onZoomOut} aria-label="Zoom out">
      &minus;
    </button>
    <span className="bbar-zoom">{zoomPercent}%</span>
    <button className="bbar-btn" onClick={onZoomIn} aria-label="Zoom in">
      +
    </button>
  </div>
);

export default BuilderBottomBar;
