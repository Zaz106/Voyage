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

function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
    const d = new Date(viewYear, viewMonth, day);
    onChange(toDateStr(d));
    setOpen(false);
  }, [viewYear, viewMonth, onChange]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChange(toDateStr(now));
    setOpen(false);
  }, [onChange]);

  /* Build calendar grid */
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const today = new Date();

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
    ? selected.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const inputClasses = [styles.trigger, className, hasError ? errorClassName : ""].filter(Boolean).join(" ");

  return (
    <div className={styles.container} ref={containerRef}>
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
          <div className={styles.grid}>
            {cells.map((cell, idx) => {
              const isToday = cell.current && isSameDay(new Date(viewYear, viewMonth, cell.day), today);
              const isSelected = cell.current && selected && isSameDay(new Date(viewYear, viewMonth, cell.day), selected);
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
