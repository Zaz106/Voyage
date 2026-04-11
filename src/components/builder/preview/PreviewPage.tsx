"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { BuilderProvider, type GlobalStyles } from "../context/BuilderContext";
import { getComponentForSectionVariant } from "../sections/_shared";
import { GOOGLE_FONTS_URL } from "../sections/_shared/contentSchemas";
import type { SectionItem } from "../sidebar/types";
import type { SectionContent } from "../context/BuilderContext";
import "./PreviewIsland.css";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type DeviceMode = "desktop" | "tablet" | "mobile";

interface PreviewSnapshot {
  globalStyles: GlobalStyles;
  sections: SectionItem[];
  sectionContent: SectionContent;
}

const DEVICE_WIDTHS: Record<
  Exclude<DeviceMode, "desktop">,
  { portrait: number; landscape: number }
> = {
  tablet: { portrait: 768, landscape: 1024 },
  mobile: { portrait: 375, landscape: 667 },
};

const ZOOM_STEPS = [50, 75, 100, 125, 150];

/* ------------------------------------------------------------------ */
/*  Preview page                                                       */
/* ------------------------------------------------------------------ */

const PreviewPage: React.FC = () => {
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [zoom, setZoom] = useState(100);
  const [landscape, setLandscape] = useState(false);

  /* -- Load snapshot from sessionStorage -- */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("luxe-preview");
      if (raw) setSnapshot(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  /* -- Inject Google Fonts -- */
  useEffect(() => {
    const id = "preview-google-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  /* -- Page-level styling -- */
  useEffect(() => {
    document.documentElement.style.background = "#0a0a0a";
    document.body.style.background = "#0a0a0a";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  /* -- Actions -- */
  const handleBack = () => {
    window.close();
    window.location.href = "/web-builder";
  };

  const handleRefresh = useCallback(() => {
    try {
      const raw = sessionStorage.getItem("luxe-preview");
      if (raw) setSnapshot(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const cycleZoom = (dir: 1 | -1) => {
    setZoom((prev) => {
      const idx = ZOOM_STEPS.indexOf(prev);
      const next = idx + dir;
      if (next < 0 || next >= ZOOM_STEPS.length) return prev;
      return ZOOM_STEPS[next];
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  /* -- Empty state -- */
  if (!snapshot) {
    return (
      <div className="preview-empty">
        No preview data found. Open preview from the builder.
      </div>
    );
  }

  /* -- Layout values -- */
  const isFramed = device !== "desktop";
  const frameW = isFramed
    ? landscape
      ? DEVICE_WIDTHS[device as "tablet" | "mobile"].landscape
      : DEVICE_WIDTHS[device as "tablet" | "mobile"].portrait
    : 0;
  const themeBg = snapshot.globalStyles.theme === "dark" ? "#0a0a0a" : "#fff";
  const visibleSections = snapshot.sections.filter((s) => s.isVisible);

  return (
    <div className={`preview-wrapper${isFramed ? " framed" : ""}`}>
      {/* Viewport dimension pill */}
      {isFramed && <div className="preview-dim-badge">{frameW}px</div>}

      {/* Content frame */}
      <div
        className={`preview-frame ${device}`}
        style={{
          ...(isFramed ? { width: frameW } : {}),
          ...(zoom !== 100
            ? { transform: `scale(${zoom / 100})`, transformOrigin: "top center" }
            : {}),
        }}
      >
        {/*
          container-type: inline-size makes @container queries and cqi units
          respond to this wrapper's width, matching builder canvas behavior.
          No iframe needed -- sections render directly.
        */}
        <div
          className="preview-content"
          style={{
            background: themeBg,
            containerType: "inline-size",
          }}
        >
          <BuilderProvider initialState={snapshot}>
            {visibleSections.map((section) => {
              const Component = getComponentForSectionVariant(
                section.id,
                section.designVariant,
              );
              if (!Component) return null;
              return <Component key={section.id} sectionId={section.id} />;
            })}
          </BuilderProvider>
        </div>
      </div>

      {/* Floating Island */}
      <div className="preview-island">
        <button
          className={`island-btn${device === "desktop" ? " active" : ""}`}
          onClick={() => {
            setDevice("desktop");
            setLandscape(false);
          }}
          aria-label="Desktop view"
          data-tooltip="Desktop"
        >
          <Monitor size={15} />
        </button>
        <button
          className={`island-btn${device === "tablet" ? " active" : ""}`}
          onClick={() => setDevice("tablet")}
          aria-label="Tablet view"
          data-tooltip="Tablet"
        >
          <Tablet size={15} />
        </button>
        <button
          className={`island-btn${device === "mobile" ? " active" : ""}`}
          onClick={() => setDevice("mobile")}
          aria-label="Mobile view"
          data-tooltip="Mobile"
        >
          <Smartphone size={15} />
        </button>

        <div className="island-divider" />

        {/* Zoom controls */}
        <button
          className="island-btn"
          onClick={() => cycleZoom(-1)}
          disabled={zoom <= ZOOM_STEPS[0]}
          aria-label="Zoom out"
          data-tooltip="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="island-zoom-label">{zoom}%</span>
        <button
          className="island-btn"
          onClick={() => cycleZoom(1)}
          disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
          aria-label="Zoom in"
          data-tooltip="Zoom in"
        >
          <ZoomIn size={14} />
        </button>

        <div className="island-divider" />

        {/* Orientation toggle (tablet / mobile only) */}
        {isFramed && (
          <>
            <button
              className={`island-btn${landscape ? " active" : ""}`}
              onClick={() => setLandscape((v) => !v)}
              aria-label={landscape ? "Switch to portrait" : "Switch to landscape"}
              data-tooltip={landscape ? "Portrait" : "Landscape"}
            >
              {device === "mobile" ? (
                <Smartphone
                  size={14}
                  className={`orient-icon${landscape ? " is-landscape" : ""}`}
                />
              ) : (
                <Tablet
                  size={14}
                  className={`orient-icon${landscape ? " is-landscape" : ""}`}
                />
              )}
            </button>
            <div className="island-divider" />
          </>
        )}

        {/* Utilities */}
        <button
          className="island-btn"
          onClick={handleRefresh}
          aria-label="Refresh"
          data-tooltip="Refresh"
        >
          <RotateCcw size={14} />
        </button>
        <button
          className="island-btn"
          onClick={toggleFullscreen}
          aria-label="Fullscreen"
          data-tooltip="Fullscreen"
        >
          <Maximize2 size={14} />
        </button>

        <div className="island-divider" />

        <button className="island-btn-back" onClick={handleBack}>
          <ArrowLeft size={14} />
          Back to Editor
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;