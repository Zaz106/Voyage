"use client";

import React, { useState, useRef, useEffect } from "react";
import { hsvToHex, hexToHsv } from "./colorUtils";

interface ColorPickerPopupProps {
  color: string;
  anchorRect: DOMRect;
  onChange: (hex: string) => void;
  onClose: () => void;
}

const ColorPickerPopup: React.FC<ColorPickerPopupProps> = ({
  color,
  anchorRect,
  onChange,
  onClose,
}) => {
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);
  const [val, setVal] = useState(1);
  const [alpha, setAlpha] = useState(1);
  const [hexDisplay, setHexDisplay] = useState("");
  const fieldRef = useRef<HTMLDivElement>(null);
  const hueStripRef = useRef<HTMLDivElement>(null);
  const opacityStripRef = useRef<HTMLDivElement>(null);
  const isDraggingField = useRef(false);
  const isDraggingHue = useRef(false);
  const isDraggingOpacity = useRef(false);

  useEffect(() => {
    const [h, s, v] = hexToHsv(color);
    setHue(h);
    setSat(s);
    setVal(v);
    setHexDisplay(color.toUpperCase().replace("#", "").slice(0, 6));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hueRef = useRef(hue);
  const satRef = useRef(sat);
  const valRef = useRef(val);
  const alphaRef = useRef(alpha);
  const onChangeRef = useRef(onChange);
  useEffect(() => { hueRef.current = hue; }, [hue]);
  useEffect(() => { satRef.current = sat; }, [sat]);
  useEffect(() => { valRef.current = val; }, [val]);
  useEffect(() => { alphaRef.current = alpha; }, [alpha]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const fireChange = (h: number, s: number, v: number, a: number) => {
    const hex = hsvToHex(h, s, v);
    if (a >= 1) {
      onChangeRef.current(hex);
    } else {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      onChangeRef.current(`rgba(${r},${g},${b},${parseFloat(a.toFixed(2))})`)
    }
  };

  const applyFieldPos = (clientX: number, clientY: number) => {
    if (!fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const newSat = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newVal = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setSat(newSat);
    setVal(newVal);
    const hex = hsvToHex(hueRef.current, newSat, newVal);
    setHexDisplay(hex.toUpperCase().replace("#", ""));
    fireChange(hueRef.current, newSat, newVal, alphaRef.current);
  };

  const applyHuePos = (clientY: number) => {
    if (!hueStripRef.current) return;
    const rect = hueStripRef.current.getBoundingClientRect();
    const newHue = Math.round(
      Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)) * 360,
    );
    setHue(newHue);
    const hex = hsvToHex(newHue, satRef.current, valRef.current);
    setHexDisplay(hex.toUpperCase().replace("#", ""));
    fireChange(newHue, satRef.current, valRef.current, alphaRef.current);
  };

  const applyOpacityPos = (clientY: number) => {
    if (!opacityStripRef.current) return;
    const rect = opacityStripRef.current.getBoundingClientRect();
    const newAlpha = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setAlpha(newAlpha);
    fireChange(hueRef.current, satRef.current, valRef.current, newAlpha);
  };

  const applyFieldPosRef = useRef(applyFieldPos);
  const applyHuePosRef = useRef(applyHuePos);
  const applyOpacityPosRef = useRef(applyOpacityPos);
  applyFieldPosRef.current = applyFieldPos;
  applyHuePosRef.current = applyHuePos;
  applyOpacityPosRef.current = applyOpacityPos;

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingField.current) applyFieldPosRef.current(e.clientX, e.clientY);
      if (isDraggingHue.current) applyHuePosRef.current(e.clientY);
      if (isDraggingOpacity.current) applyOpacityPosRef.current(e.clientY);
    };
    const onMouseUp = () => {
      isDraggingField.current = false;
      isDraggingHue.current = false;
      isDraggingOpacity.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleHexChange = (raw: string) => {
    const clean = raw.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    setHexDisplay(clean.toUpperCase());
    if (clean.length === 6) {
      const fullHex = "#" + clean;
      const [h, s, v] = hexToHsv(fullHex);
      setHue(h);
      setSat(s);
      setVal(v);
      fireChange(h, s, v, alphaRef.current);
    }
  };

  const currentHex = hsvToHex(hue, sat, val);
  const currentR = parseInt(currentHex.slice(1, 3), 16);
  const currentG = parseInt(currentHex.slice(3, 5), 16);
  const currentB = parseInt(currentHex.slice(5, 7), 16);

  const PICKER_WIDTH = 280;
  const PICKER_HEIGHT = 230;
  let left = anchorRect.right + 10;
  let top = anchorRect.top - 4;
  if (typeof window !== "undefined") {
    if (left + PICKER_WIDTH > window.innerWidth - 8)
      left = anchorRect.left - PICKER_WIDTH - 10;
    if (top + PICKER_HEIGHT > window.innerHeight - 8)
      top = window.innerHeight - PICKER_HEIGHT - 8;
    if (top < 8) top = 8;
  }

  const pickerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={pickerRef}
      data-prevent-outside-close="true"
      style={{
        position: "fixed",
        top,
        left,
        zIndex: 999,
        background: "#1e1e1e",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          padding: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          width: PICKER_WIDTH,
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", gap: 8, height: 140 }}>
          {/* Saturation / Value field */}
          <div
            ref={fieldRef}
            style={{
              flex: 1,
              height: "100%",
              position: "relative",
              cursor: "crosshair",
              borderRadius: 4,
              overflow: "hidden",
              background: `hsl(${hue}, 100%, 50%)`,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              isDraggingField.current = true;
              applyFieldPosRef.current(e.clientX, e.clientY);
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right, #fff, transparent)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, transparent, #000)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${sat * 100}%`,
                top: `${(1 - val) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "2px solid white",
                boxShadow: "0 0 3px rgba(0,0,0,0.8)",
                pointerEvents: "none",
                background: currentHex,
              }}
            />
          </div>

          {/* Hue strip */}
          <div
            ref={hueStripRef}
            style={{
              width: 20,
              height: "100%",
              position: "relative",
              cursor: "ns-resize",
              borderRadius: 4,
              background:
                "linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              flexShrink: 0,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              isDraggingHue.current = true;
              applyHuePosRef.current(e.clientY);
            }}
          >
            <div
              style={{
                position: "absolute",
                top: `${(hue / 360) * 100}%`,
                left: -2,
                right: -2,
                height: 3,
                borderRadius: 2,
                background: "white",
                border: "1px solid rgba(0,0,0,0.4)",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Opacity strip */}
          <div
            ref={opacityStripRef}
            style={{
              width: 20,
              height: "100%",
              position: "relative",
              cursor: "ns-resize",
              borderRadius: 4,
              flexShrink: 0,
              overflow: "hidden",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              isDraggingOpacity.current = true;
              applyOpacityPosRef.current(e.clientY);
            }}
          >
            {/* Checkerboard background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "repeating-conic-gradient(#555 0% 25%, #333 0% 50%)",
                backgroundSize: "8px 8px",
              }}
            />
            {/* Color-to-transparent gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(to bottom, rgba(${currentR},${currentG},${currentB},1), rgba(${currentR},${currentG},${currentB},0))`,
              }}
            />
            {/* Indicator */}
            <div
              style={{
                position: "absolute",
                top: `${(1 - alpha) * 100}%`,
                left: -2,
                right: -2,
                height: 3,
                borderRadius: 2,
                background: "white",
                border: "1px solid rgba(0,0,0,0.4)",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Preview swatch + hex input + opacity input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: `rgba(${currentR},${currentG},${currentB},${alpha})`,
              border: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#2a2a2a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              padding: "4px 8px",
              flex: 1,
            }}
          >
            <span style={{ color: "#555", fontSize: 11, marginRight: 4 }}>#</span>
            <input
              value={hexDisplay}
              onChange={(e) => handleHexChange(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: 12,
                outline: "none",
                fontFamily: "monospace",
                width: "100%",
                textTransform: "uppercase",
              }}
              maxLength={6}
              spellCheck={false}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#2a2a2a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              padding: "4px 6px",
              width: 54,
              flexShrink: 0,
              gap: 2,
            }}
          >
            <input
              value={Math.round(alpha * 100)}
              onChange={(e) => {
                const parsed = parseInt(e.target.value);
                const clamped = Math.max(0, Math.min(100, isNaN(parsed) ? 0 : parsed));
                const newAlpha = clamped / 100;
                setAlpha(newAlpha);
                fireChange(hueRef.current, satRef.current, valRef.current, newAlpha);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: 12,
                outline: "none",
                fontFamily: "monospace",
                width: "100%",
                textAlign: "right",
              }}
              maxLength={3}
            />
            <span style={{ color: "#555", fontSize: 11, flexShrink: 0 }}>%</span>
          </div>
        </div>
      </div>
  );
};

export default ColorPickerPopup;
