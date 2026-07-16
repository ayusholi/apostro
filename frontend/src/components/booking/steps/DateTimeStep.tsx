"use client";

import { useMemo } from "react";
import { Calendar } from "@/components/booking/Calendar";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { TimezoneSelect } from "@/components/booking/TimezoneSelect";
import { StateBanner } from "@/components/ui/StateBanner";
import { groupSlotsByLocalDate } from "@/hooks/useBookingWizard";

export function DateTimeStep({
  status,
  slots,
  error,
  displayTimeZone,
  onChangeTimeZone,
  selectedDate,
  onSelectDate,
  selectedSlotStartUtc,
  onSelectSlot,
}: {
  status: "idle" | "loading" | "error" | "success";
  slots: string[] | null;
  error: string | null;
  displayTimeZone: string;
  onChangeTimeZone: (tz: string) => void;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  selectedSlotStartUtc: string | null;
  onSelectSlot: (startUtc: string) => void;
}) {
  const grouped = useMemo(() => groupSlotsByLocalDate(slots ?? [], displayTimeZone), [slots, displayTimeZone]);
  const dateKeys = useMemo(() => [...grouped.keys()].sort(), [grouped]);

  if (status === "loading" || status === "idle") {
    return <StateBanner variant="loading" title="Checking availability…" />;
  }
  if (status === "error") {
    return <StateBanner variant="error" title="Couldn't load availability">{error}</StateBanner>;
  }
  if (dateKeys.length === 0) {
    return (
      <StateBanner variant="empty" title="No availability in the next two months">
        This solicitor has no open slots right now. Try a different solicitor, or call the office directly.
      </StateBanner>
    );
  }

  const daySlots = selectedDate ? (grouped.get(selectedDate) ?? []) : [];

  return (
    <div>
      <div style={{ maxWidth: 220, marginBottom: 24 }}>
        <TimezoneSelect value={displayTimeZone} onChange={onChangeTimeZone} />
      </div>
      <div className="datetime-layout">
        <Calendar
          selectedDate={selectedDate}
          onSelect={onSelectDate}
          availableDates={new Set(dateKeys)}
          minDate={dateKeys[0]}
          maxDate={dateKeys[dateKeys.length - 1]}
        />
        <div className="datetime-layout__slots">
          <h4>{selectedDate ? "Available times" : "Pick a date to see times"}</h4>
          {selectedDate && (
            <TimeSlotGrid
              slots={daySlots}
              selected={selectedSlotStartUtc}
              onSelect={onSelectSlot}
              displayTimeZone={displayTimeZone}
            />
          )}
        </div>
      </div>
    </div>
  );
}
