/** 0 = Sunday ... 6 = Saturday, matching Date#getUTCDay(). Times are "HH:MM" 24h, in the office's local timezone. */
export type DayHours = { start: string; end: string };
export type WorkingHours = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayHours>>;

export function parseHHMM(value: string): { hour: number; minute: number } {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}
