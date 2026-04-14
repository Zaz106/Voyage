"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import styles from "./DatePicker.module.css";

interface DatePickerProps {
  value: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  errorClassName?: string;
  hasError?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/* Use UTC throughout to prevent date shifting across timezones */
function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function toDateStr(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
}

export default function DatePicker({ value, onChange, placeholder = "Select date", className, errorClassName, hasError }: DatePickerProps) {
  const selected = parseDate(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? new Date().getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Sync view when value changes externally */
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  }, [viewMonth]);

  const selectDay = useCallback((day: number) => {
    const d = new Date(Date.UTC(viewYear, viewMonth, day));
    onChange(toDateStr(d));
    setOpen(false);
  }, [viewYear, viewMonth, onChange]);

  const goToToday = useCallback(() => {
    const now = new Date();
    const utcToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    setViewYear(utcToday.getUTCFullYear());
    setViewMonth(utcToday.getUTCMonth());
    onChange(toDateStr(utcToday));
    setOpen(false);
  }, [onChange]);

  /* Build calendar grid */
  const firstDayOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const daysInPrevMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const cells: { day: number; current: boolean }[] = [];
  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  // Next month leading days (fill to 42 cells for 6 rows, or 35 for 5)
  const totalRows = cells.length > 35 ? 42 : 35;
  let nextDay = 1;
  while (cells.length < totalRows) {
    cells.push({ day: nextDay++, current: false });
  }

  const displayValue = selected
    ? new Date(selected.getTime()).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    : "";

  const inputClasses = [styles.trigger, className, hasError ? errorClassName : ""].filter(Boolean).join(" ");

  /* Keyboard navigation inside the open dropdown */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open) return;

    const arrowKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    if (!arrowKeys.includes(e.key)) return;
    e.preventDefault();

    const focused = document.activeElement as HTMLElement | null;
    const grid = containerRef.current?.querySelector("[data-grid]");
    if (!grid) return;
    const buttons = Array.from(grid.querySelectorAll<HTMLButtonElement>("button[tabindex='0']"));
    const idx = buttons.indexOf(focused as HTMLButtonElement);
    if (idx === -1) return;

    let next = idx;
    if (e.key === "ArrowLeft") next = Math.max(0, idx - 1);
    if (e.key === "ArrowRight") next = Math.min(buttons.length - 1, idx + 1);
    if (e.key === "ArrowUp") next = Math.max(0, idx - 7);
    if (e.key === "ArrowDown") next = Math.min(buttons.length - 1, idx + 7);

    buttons[next]?.focus();
  }, [open]);

  return (
    <div className={styles.container} ref={containerRef} onKeyDown={handleKeyDown}>
      <button type="button" className={inputClasses} onClick={() => setOpen(o => !o)}>
        <span className={displayValue ? styles.triggerValue : styles.triggerPlaceholder}>
          {displayValue || placeholder}
        </span>
        <Calendar size={16} className={styles.triggerIcon} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          {/* Month / Year header */}
          <div className={styles.calHeader}>
            <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className={styles.calTitle}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day labels */}
          <div className={styles.dayLabels}>
            {DAY_LABELS.map(d => (
              <span key={d} className={styles.dayLabel}>{d}</span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className={styles.grid} data-grid>
            {cells.map((cell, idx) => {
              const cellDate = new Date(Date.UTC(viewYear, viewMonth, cell.day));
              const isToday = cell.current && isSameDay(cellDate, today);
              const isSelected = cell.current && selected && isSameDay(cellDate, selected);
              return (
                <button
                  key={idx}
                  type="button"
                  className={[
                    styles.dayCell,
                    !cell.current && styles.dayCellOther,
                    isToday && styles.dayCellToday,
                    isSelected && styles.dayCellSelected,
                  ].filter(Boolean).join(" ")}
                  onClick={() => cell.current && selectDay(cell.day)}
                  tabIndex={cell.current ? 0 : -1}
                  aria-label={cell.current ? `${cell.day} ${MONTH_NAMES[viewMonth]} ${viewYear}` : undefined}
                  aria-pressed={isSelected ? true : undefined}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <button type="button" className={styles.todayBtn} onClick={goToToday}>
            Today
          </button>
        </div>
      )}
    </div>
  );
}
