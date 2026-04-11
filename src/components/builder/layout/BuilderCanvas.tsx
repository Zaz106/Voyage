"use client";

import React, { useRef, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { useBuilder } from "../context/BuilderContext";
import { getComponentForSectionVariant } from "../sections/_shared";
import "./BuilderCanvas.css";

export interface BuilderCanvasHandle {
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

// Dev mode: three breakpoints displayed side-by-side on the same canvas
const DEV_PAGE_SIZES = [
  { width: 1920, label: "Desktop" },
  { width: 768,  label: "Tablet"  },
  { width: 375,  label: "Mobile"  },
] as const;
const DEV_GAP = 60;
const DEV_TOTAL_WIDTH =
  DEV_PAGE_SIZES.reduce((sum, p) => sum + p.width, 0) + DEV_GAP * (DEV_PAGE_SIZES.length - 1);

interface BuilderCanvasProps {
  onScaleChange?: (scale: number) => void;
  /** When true, renders Desktop / Tablet / Mobile pages side-by-side on the same canvas */
  devMode?: boolean;
}

const BuilderCanvas = forwardRef<BuilderCanvasHandle, BuilderCanvasProps>(({ onScaleChange, devMode }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const sectionClickedRef = useRef(false);
  const { pageSections, activePage, activeConfigId, setActiveConfigId, globalStyles, scrollToSectionId, setScrollToSectionId, isAiGenerating } = useBuilder();
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const themeBg = globalStyles.theme === "dark" ? "#0a0a0a" : "#fff";

  // Responsive canvas: match page width to user's screen resolution
  const [canvasPageWidth, setCanvasPageWidth] = useState(1920);
  const defaultViewRef = useRef({ x: 0, y: 0, scale: 1 });

  // Compute initial default zoom before first paint to avoid flash
  React.useLayoutEffect(() => {
    const pageWidth = devMode ? DEV_TOTAL_WIDTH : window.screen.width;
    if (!devMode) setCanvasPageWidth(window.screen.width);

    const container = containerRef.current;
    if (!container) return;

    const compute = (cw: number, ch: number) => {
      const scale = Math.max(Math.min((cw * 0.82) / pageWidth, 1), 0.3);
      const x = (cw / 2) * (1 - scale);
      const y = ch * 0.05 - scale * 100;
      defaultViewRef.current = { x, y, scale };
      setViewState({ x, y, scale });
    };

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    compute(cw, ch);
  }, [devMode]);

  // Keep default reference up-to-date on window resize
  React.useEffect(() => {
    const onResize = () => {
      const totalWidth = devMode ? DEV_TOTAL_WIDTH : window.screen.width;
      if (!devMode) setCanvasPageWidth(window.screen.width);
      const container = containerRef.current;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const scale = Math.max(Math.min((cw * 0.82) / totalWidth, 1), 0.3);
      const x = (cw / 2) * (1 - scale);
      const y = ch * 0.05 - scale * 100;
      defaultViewRef.current = { x, y, scale };
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [devMode]);

  // Touch tracking refs
  const touchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastPinchDistRef = useRef<number | null>(null);
  const lastPinchCenterRef = useRef<{ x: number; y: number } | null>(null);

  const sections = pageSections[activePage] ?? [];

  // Limits for zoom
  const minZoom = 0.25;
  const maxZoom = 3;

  // Use a ref to access current state inside the non-passive event listener
  const viewStateRef = useRef(viewState);
  // Update ref whenever state changes
  React.useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  // Intercept the click event that fires after pointerUp.
  // If pointerUp handled a section click, stop propagation so the
  // outside-click handler doesn't immediately clear activeConfigId.
  // Otherwise let it propagate (clicking canvas background closes sidebar).
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onClick = (e: MouseEvent) => {
      if (sectionClickedRef.current) {
        sectionClickedRef.current = false;
        e.stopPropagation();
      }
    };
    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const { deltaX, deltaY, clientX, clientY } = e;
      const { x, y, scale } = viewStateRef.current;

      if (e.ctrlKey) {
        // Zoom Logic (Ctrl + Scroll)
        const zoomSensitivity = 0.001;
        const delta = -deltaY * zoomSensitivity;
        const newScale = Math.min(
          Math.max(scale + delta * scale, minZoom),
          maxZoom,
        );

        const rect = container.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const newX = mouseX - (mouseX - x) * (newScale / scale);
        const newY = mouseY - (mouseY - y) * (newScale / scale);

        setViewState({ x: newX, y: newY, scale: newScale });
      } else {
        // Pan Logic (Normal Scroll)
        let effectiveDeltaX = deltaX;
        let effectiveDeltaY = deltaY;

        if (e.shiftKey && deltaX === 0) {
          effectiveDeltaX = deltaY;
          effectiveDeltaY = 0;
        }

        setViewState((prev) => ({
          ...prev,
          x: prev.x - effectiveDeltaX,
          y: prev.y - effectiveDeltaY,
        }));
      }
    };

    // Add non-passive event listener to prevent browser zoom
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, []); // Empty dependency array, state accessed via ref

  // ---- Touch handlers for pinch-to-zoom and faster panning ----
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getTouchDist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    const getTouchCenter = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    });

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        touchesRef.current.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      if (touchesRef.current.size === 1) {
        const [first] = touchesRef.current.values();
        startPosRef.current = { x: first.x, y: first.y };
        lastPosRef.current = { x: first.x, y: first.y };
      }
      if (touchesRef.current.size === 2) {
        const pts = [...touchesRef.current.values()];
        lastPinchDistRef.current = getTouchDist(pts[0], pts[1]);
        lastPinchCenterRef.current = getTouchCenter(pts[0], pts[1]);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // prevent browser scroll/zoom
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        touchesRef.current.set(t.identifier, { x: t.clientX, y: t.clientY });
      }

      if (touchesRef.current.size === 2) {
        // Pinch zoom
        const pts = [...touchesRef.current.values()];
        const dist = getTouchDist(pts[0], pts[1]);
        const center = getTouchCenter(pts[0], pts[1]);

        if (lastPinchDistRef.current !== null && lastPinchCenterRef.current !== null) {
          const scaleFactor = dist / lastPinchDistRef.current;
          const { x, y, scale } = viewStateRef.current;
          const rect = container.getBoundingClientRect();
          const cx = center.x - rect.left;
          const cy = center.y - rect.top;

          const newScale = Math.min(Math.max(scale * scaleFactor, minZoom), maxZoom);
          const newX = cx - (cx - x) * (newScale / scale) + (center.x - lastPinchCenterRef.current.x);
          const newY = cy - (cy - y) * (newScale / scale) + (center.y - lastPinchCenterRef.current.y);

          setViewState({ x: newX, y: newY, scale: newScale });
        }
        lastPinchDistRef.current = dist;
        lastPinchCenterRef.current = center;
      } else if (touchesRef.current.size === 1 && lastPosRef.current) {
        // Single finger pan
        const [current] = touchesRef.current.values();
        const dx = current.x - lastPosRef.current.x;
        const dy = current.y - lastPosRef.current.y;
        lastPosRef.current = { x: current.x, y: current.y };
        setViewState((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      // Check for tap on section before removing touches
      if (touchesRef.current.size === 1 && startPosRef.current) {
        const [endPos] = touchesRef.current.values();
        const dx = endPos.x - startPosRef.current.x;
        const dy = endPos.y - startPosRef.current.y;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          // This was a tap — find the section under the finger
          const el = document.elementFromPoint(endPos.x, endPos.y);
          const sectionWrapper = el?.closest("[data-canvas-section-id]");
          if (sectionWrapper) {
            const sectionId = sectionWrapper.getAttribute("data-canvas-section-id");
            if (sectionId) {
              sectionClickedRef.current = true;
              setActiveConfigId(activeConfigId === sectionId ? null : sectionId);
            }
          }
        }
      }

      for (let i = 0; i < e.changedTouches.length; i++) {
        touchesRef.current.delete(e.changedTouches[i].identifier);
      }
      if (touchesRef.current.size < 2) {
        lastPinchDistRef.current = null;
        lastPinchCenterRef.current = null;
      }
      if (touchesRef.current.size === 1) {
        const [remaining] = touchesRef.current.values();
        lastPosRef.current = { x: remaining.x, y: remaining.y };
      }
      if (touchesRef.current.size === 0) {
        startPosRef.current = null;
        lastPosRef.current = null;
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);
    container.addEventListener("touchcancel", onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [activeConfigId]);

  // Scroll-to-section: animate the canvas to center the target section
  React.useEffect(() => {
    if (!scrollToSectionId || !containerRef.current) return;
    const sectionEl = containerRef.current.querySelector(
      `[data-canvas-section-id="${CSS.escape(scrollToSectionId)}"]`
    ) as HTMLElement | null;
    const pageEl = containerRef.current.querySelector(".canvas-page") as HTMLElement | null;
    if (!sectionEl || !pageEl) { setScrollToSectionId(null); return; }

    const containerRect = containerRef.current.getBoundingClientRect();
    const { scale } = viewStateRef.current;

    // Get section position relative to the page element
    const sectionTop = sectionEl.offsetTop;
    const sectionHeight = sectionEl.offsetHeight;
    const sectionCenterY = sectionTop + sectionHeight / 2;

    // Page is positioned at left:50%, margin-left:-600px, top:100px
    const pageOriginX = pageEl.offsetLeft + pageEl.offsetWidth / 2;
    const pageOriginY = 100 + sectionCenterY;

    // Target: center of container viewport
    const targetX = containerRect.width / 2 - pageOriginX * scale;
    const targetY = containerRect.height / 2 - pageOriginY * scale;

    // Animate from current position to target
    const startX = viewStateRef.current.x;
    const startY = viewStateRef.current.y;
    const duration = 400;
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const x = startX + (targetX - startX) * eased;
      const y = startY + (targetY - startY) * eased;
      setViewState((prev) => ({ ...prev, x, y }));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    setScrollToSectionId(null);
  }, [scrollToSectionId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Skip touch events — handled by touch listeners above
    if (e.pointerType === "touch") return;
    if (e.button === 1 || e.button === 0) {
      e.preventDefault();
      startPosRef.current = { x: e.clientX, y: e.clientY };
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      setIsPanning(true);
      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (!isPanning || !lastPosRef.current) return;

    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };

    setViewState((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    setIsPanning(false);
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    // Detect click (minimal movement) on a canvas section
    if (startPosRef.current && e.button === 0) {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const sectionWrapper = el?.closest("[data-canvas-section-id]");
        if (sectionWrapper) {
          const sectionId = sectionWrapper.getAttribute("data-canvas-section-id");
          if (sectionId) {
            sectionClickedRef.current = true;
            setActiveConfigId(activeConfigId === sectionId ? null : sectionId);
          }
        }
      }
    }
    startPosRef.current = null;
    lastPosRef.current = null;
  };

  const resetView = () => {
    // Recalculate for the current container size
    const container = containerRef.current;
    if (container) {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const totalWidth = devMode ? DEV_TOTAL_WIDTH : canvasPageWidth;
      const scale = Math.max(Math.min((cw * 0.82) / totalWidth, 1), 0.3);
      const x = (cw / 2) * (1 - scale);
      const y = ch * 0.05 - scale * 100;
      defaultViewRef.current = { x, y, scale };
    }
    setViewState(defaultViewRef.current);
  };

  const handleZoomIn = () => {
    setViewState((prev) => {
      let newScale = (Math.floor(prev.scale * 20) + 1) / 20;
      if (newScale <= prev.scale + 0.001) newScale += 0.05;
      newScale = Math.min(newScale, maxZoom);
      return { ...prev, scale: newScale };
    });
  };

  const handleZoomOut = () => {
    setViewState((prev) => {
      let newScale = (Math.ceil(prev.scale * 20) - 1) / 20;
      if (newScale >= prev.scale - 0.001) newScale -= 0.05;
      newScale = Math.max(newScale, minZoom);
      return { ...prev, scale: newScale };
    });
  };

  // Expose controls to parent via ref
  const fnRef = useRef({ resetView, handleZoomIn, handleZoomOut });
  fnRef.current = { resetView, handleZoomIn, handleZoomOut };
  useImperativeHandle(ref, () => ({
    resetView: () => fnRef.current.resetView(),
    zoomIn: () => fnRef.current.handleZoomIn(),
    zoomOut: () => fnRef.current.handleZoomOut(),
  }), []);

  // Report scale changes to parent
  React.useEffect(() => {
    onScaleChange?.(viewState.scale);
  }, [viewState.scale, onScaleChange]);

  // Memoize section rendering so pan/zoom re-renders don't rebuild section trees
  const sectionItems = useMemo(() =>
    sections
      .filter((s) => s.isVisible)
      .map((section) => {
        const Component = getComponentForSectionVariant(section.id, section.designVariant);
        if (!Component) return null;
        const isActive = activeConfigId === section.id;
        const isHovered = hoveredSectionId === section.id;
        const showHighlight = isHovered || isActive;
        return (
          <div
            key={section.id + (section.designVariant ?? "")}
            data-canvas-section-id={section.id}
            className={`canvas-section-wrapper${isAiGenerating ? " ai-generating" : ""}`}
            onMouseEnter={() => setHoveredSectionId(section.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            <Component sectionId={section.id} />
            {showHighlight && (
              <div className={`canvas-section-overlay${isActive ? " active" : ""}`}>
                <span className="canvas-section-label">{section.title}</span>
              </div>
            )}
          </div>
        );
      }),
    [sections, activeConfigId, hoveredSectionId, isAiGenerating],
  );

  const transformStyle = `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`;

  return (
    <div
      ref={containerRef}
      className="builder-canvas-container"
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Moving wrapper for grid and content */}
      <div
        className="canvas-content-wrapper"
        style={{ transform: transformStyle }}
      >
        <div className="infinite-grid-background" />

        {devMode ? (
          <div className="dev-pages-row" style={{ marginLeft: -DEV_TOTAL_WIDTH / 2 }}>
            {DEV_PAGE_SIZES.map(({ width, label }) => (
              <div key={width} className="dev-page-col">
                <div className="dev-page-label">{label} <span>{width}px</span></div>
                <div className="dev-page-inner" style={{ backgroundColor: themeBg, width }}>
                  {sectionItems}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="canvas-page"
            style={{ backgroundColor: themeBg, width: canvasPageWidth, marginLeft: -canvasPageWidth / 2 }}
          >
            {sectionItems}
          </div>
        )}
      </div>

      {/* Bottom bar: Reset | AI banner (conditional) | Zoom */}
      <div className="canvas-bottom-bar" onPointerDown={(e) => e.stopPropagation()}>
        <button onClick={resetView} className="reset-view-button">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset View
        </button>

        {isAiGenerating && (
          <div className="ai-generating-banner">
            <span className="ai-banner-icon">✦</span>
            <span>AI is writing your content</span>
            <span className="ai-typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        )}

        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="zoom-button">-</button>
          <span className="zoom-display">{Math.round(viewState.scale * 100)}%</span>
          <button onClick={handleZoomIn} className="zoom-button">+</button>
        </div>
      </div>
    </div>
  );
});

BuilderCanvas.displayName = "BuilderCanvas";

export default BuilderCanvas;
