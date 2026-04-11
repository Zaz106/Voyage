"use client";

import React, { useState, useRef, useEffect } from "react";
import BuilderHeader from "./BuilderHeader";
import BuilderSidebar from "./BuilderSidebar";
import BuilderCanvas, { BuilderCanvasHandle } from "./BuilderCanvas";
import BuilderBottomBar from "./BuilderBottomBar";
import { BuilderProvider, useBuilder } from "../context/BuilderContext";
import { ToolSection } from "../sidebar/types";
import "./BuilderLayout.css";

/* Inner component that has access to BuilderContext */
const BuilderLayoutInner: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeToolSection, setActiveToolSection] = useState<ToolSection | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [devMode, setDevMode] = useState(false);
  const canvasRef = useRef<BuilderCanvasHandle>(null);
  const { activeConfigId, setActiveConfigId, undo, redo, canUndo, canRedo } = useBuilder();

  // When a section is clicked on the canvas, open the sidebar drawer
  // with "sections" expanded so the secondary sidebar is visible
  const isMobileRef = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    isMobileRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { isMobileRef.current = e.matches; };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (activeConfigId && isMobileRef.current) {
      setActiveToolSection("sections");
      setSidebarOpen(true);
    }
  }, [activeConfigId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "p") {
        e.preventDefault();
        // Trigger preview via the header button click
        document.getElementById("builder-preview-btn")?.click();
      } else if (e.key === "e") {
        e.preventDefault();
        document.getElementById("builder-export-btn")?.click();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveConfigId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [undo, redo, setActiveConfigId]);

  const handleSelectSection = (section: ToolSection) => {
    if (sidebarOpen && activeToolSection === section) {
      setSidebarOpen(false);
      setActiveToolSection(null);
    } else {
      setActiveToolSection(section);
      setSidebarOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setActiveToolSection(null);
  };

  return (
    <>
      <BuilderHeader
        devMode={devMode}
        onToggleDevMode={() => setDevMode((p) => !p)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
      <div className="builder-main">
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={handleCloseSidebar}
          />
        )}
        <div className={`sidebar-drawer ${sidebarOpen ? "open" : ""}`}>
          <BuilderSidebar
            forceExpandSection={activeToolSection}
          />
        </div>
        <BuilderCanvas ref={canvasRef} onScaleChange={setCanvasScale} devMode={devMode} />
      </div>
      <BuilderBottomBar
        activeToolSection={sidebarOpen ? activeToolSection : null}
        onSelectSection={handleSelectSection}
        onResetView={() => canvasRef.current?.resetView()}
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        zoomPercent={Math.round(canvasScale * 100)}
      />
    </>
  );
};

const BuilderLayout = () => {
  return (
    <BuilderProvider>
      <div className="builder-layout">
        <BuilderLayoutInner />
      </div>
    </BuilderProvider>
  );
};

export default BuilderLayout;
