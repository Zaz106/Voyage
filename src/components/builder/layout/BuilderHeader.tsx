"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MonitorSmartphone, Download, Eye, Loader2, Undo2, Redo2 } from "lucide-react";
import { useBuilder } from "../context/BuilderContext";
import { exportProject } from "../export/exportProject";
import "./BuilderHeader.css";

interface BuilderHeaderProps {
  devMode?: boolean;
  onToggleDevMode?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  devMode,
  onToggleDevMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const router = useRouter();
  const { globalStyles, pageSections, sectionContent, activePage } = useBuilder();
  const [isExporting, setIsExporting] = useState(false);

  const handlePreview = () => {
    const snapshot = {
      globalStyles,
      sections: pageSections[activePage] ?? [],
      sectionContent,
    };
    sessionStorage.setItem("luxe-preview", JSON.stringify(snapshot));
    window.open("/web-builder/preview", "_blank");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportProject(globalStyles, pageSections, sectionContent);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="builder-header">
      <div className="header-left">
        <button
          onClick={() => router.back()}
          className="back-button"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
          <span className="back-button-label">Return</span>
        </button>
        <div className="divider"></div>
        <h1 className="header-title">Web Builder Tool</h1>
      </div>

      <div className="header-center">
        <button
          className="header-action-button icon-only"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 size={15} />
        </button>
        <button
          className="header-action-button icon-only"
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 size={15} />
        </button>
      </div>

      <div className="header-right">
        <button
          className={`header-action-button dev-button${devMode ? " active" : ""}`}
          onClick={onToggleDevMode}
          aria-label="Toggle responsive dev mode"
        >
          <MonitorSmartphone size={16} />
          <span className="header-action-label">Dev</span>
        </button>
        <button
          id="builder-export-btn"
          className="header-action-button"
          aria-label="Download code"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 size={16} className="spin-icon" /> : <Download size={16} />}
          <span className="header-action-label">{isExporting ? "Exporting…" : "Export"}</span>
        </button>
        <button
          id="builder-preview-btn"
          className="header-action-button primary"
          onClick={handlePreview}
          aria-label="Preview site"
        >
          <Eye size={16} />
          <span className="header-action-label">Preview</span>
        </button>
      </div>
    </header>
  );
};

export default BuilderHeader;
