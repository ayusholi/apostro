"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

/**
 * Accessible month-grid date picker (ARIA APG "date picker grid" pattern):
 * roving tabindex, arrow-key navigation that crosses month boundaries,
 * Home/End for start/end of week, disabled/available days exposed via
 * aria-disabled so a screen reader states which days can't be booked rather
 * than silently omitting them.
 */
export function Calendar({
  selectedDate,
  onSelect,
  availableDates,
  minDate,
  maxDate,
}: {
  selectedDate: string | null;
  onSelect: (dateKey: string) => void;
  availableDates: Set<string>;
  minDate: string;
  maxDate: string;
}) {
  const initial = selectedDate ?? minDate;
  const [initYear, initMonth] = initial.split("-").map(Number);
  const [view, setView] = useState({ year: initYear, month: initMonth });
  const [focusedKey, setFocusedKey] = useState(selectedDate ?? minDate);
  const gridRef = useRef<HTMLDivElement>(null);

  const todayKey = useMemo(() => {
    const now = new Date();
    return toKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }, []);

  const days = useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(view.year, view.month - 1, 1));
    const startWeekday = firstOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(view.year, view.month, 0)).getUTCDate();
    const cells: { key: string; day: number; inMonth: boolean }[] = [];

    for (let i = 0; i < startWeekday; i++) cells.push({ key: `pad-before-${i}`, day: 0, inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ key: toKey(view.year, view.month, d), day: d, inMonth: true });
    while (cells.length % 7 !== 0) cells.push({ key: `pad-after-${cells.length}`, day: 0, inMonth: false });

    return cells;
  }, [view]);

  function isSelectable(key: string): boolean {
    return key >= minDate && key <= maxDate && availableDates.has(key);
  }

  function moveFocus(deltaDays: number) {
    const [y, m, d] = focusedKey.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + deltaDays));
    const nextKey = toKey(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
    if (nextKey < minDate || nextKey > maxDate) return;
    setFocusedKey(nextKey);
    if (next.getUTCFullYear() !== view.year || next.getUTCMonth() + 1 !== view.month) {
      setView({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 });
    }
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-key="${nextKey}"]`)?.focus();
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    if (e.key in moves) {
      e.preventDefault();
      moveFocus(moves[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      const [y, m, d] = focusedKey.split("-").map(Number);
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      moveFocus(-dow);
    } else if (e.key === "End") {
      e.preventDefault();
      const [y, m, d] = focusedKey.split("-").map(Number);
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      moveFocus(6 - dow);
    } else if (e.key === "Enter" || e.key === " ") {
      if (isSelectable(focusedKey)) {
        e.preventDefault();
        onSelect(focusedKey);
      }
    }
  }

  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(view.year, view.month - 1, 1)),
  );
  const minYearMonth = new Date(minDate).getUTCFullYear() * 12 + new Date(minDate).getUTCMonth() + 1;
  const canGoPrev = view.year * 12 + view.month > minYearMonth;

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button
          type="button"
          className="calendar__nav"
          aria-label="Previous month"
          disabled={!canGoPrev}
          onClick={() => setView((v) => addMonths(v.year, v.month, -1))}
        >
          ‹
        </button>
        <strong>{monthLabel}</strong>
        <button
          type="button"
          className="calendar__nav"
          aria-label="Next month"
          onClick={() => setView((v) => addMonths(v.year, v.month, 1))}
        >
          ›
        </button>
      </div>
      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div
        className="calendar__grid"
        role="grid"
        aria-label={`Available dates, ${monthLabel}`}
        ref={gridRef}
        onKeyDown={onKeyDown}
      >
        {days.map((cell) => {
          if (!cell.inMonth) return <div key={cell.key} aria-hidden="true" />;
          const selectable = isSelectable(cell.key);
          const isSelected = cell.key === selectedDate;
          const isFocusTarget = cell.key === focusedKey;
          return (
            <button
              key={cell.key}
              type="button"
              role="gridcell"
              data-key={cell.key}
              data-available={selectable}
              data-today={cell.key === todayKey}
              aria-disabled={!selectable}
              aria-selected={isSelected}
              aria-label={`${cell.day} ${monthLabel}${!selectable ? ", no availability" : ""}`}
              tabIndex={isFocusTarget ? 0 : -1}
              className="calendar__day"
              disabled={!selectable}
              onClick={() => selectable && onSelect(cell.key)}
              onFocus={() => setFocusedKey(cell.key)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
