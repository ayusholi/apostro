"use client";

import { formatInTimeZone } from "@/domain/scheduling/timezone";
import { StateBanner } from "@/components/ui/StateBanner";

export function TimeSlotGrid({
  slots,
  selected,
  onSelect,
  displayTimeZone,
}: {
  slots: string[]; // ISO UTC start times, already filtered to the selected day
  selected: string | null;
  onSelect: (startUtc: string) => void;
  displayTimeZone: string;
}) {
  if (slots.length === 0) {
    return (
      <StateBanner variant="empty" title="No times available that day">
        Try another date on the calendar — solicitors&apos; schedules vary day to day.
      </StateBanner>
    );
  }

  return (
    <div className="slot-grid" role="group" aria-label="Available times">
      {slots.map((startUtc) => (
        <button
          key={startUtc}
          type="button"
          className="slot-btn"
          aria-pressed={selected === startUtc}
          onClick={() => onSelect(startUtc)}
        >
          {formatInTimeZone(startUtc, displayTimeZone, { hour: "numeric", minute: "2-digit" })}
        </button>
      ))}
    </div>
  );
}
