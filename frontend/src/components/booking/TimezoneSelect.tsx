"use client";

import { COMMON_TIMEZONES } from "@/domain/scheduling/timezone";

/**
 * A plain native <select> is deliberately the whole implementation — it's
 * already keyboard/screen-reader accessible, and a custom listbox would only
 * add risk here for no visual gain. Auto-detection of the visitor's zone
 * happens in the caller via useDetectedTimeZone, not in here — this
 * component is a pure controlled input.
 */
export function TimezoneSelect({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  const options = COMMON_TIMEZONES.some((z) => z.value === value)
    ? COMMON_TIMEZONES
    : [{ value, label: `${value} (detected)` }, ...COMMON_TIMEZONES];

  return (
    <div className="field">
      <label htmlFor="booking-timezone">Timezone</label>
      <select id="booking-timezone" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
}
