export type Window = { weekday: number; start_min: number; end_min: number };
export type Busy = { start: number; end: number };

export const SLOT_STEP_MIN = 30;

/** Local-date string (YYYY-MM-DD) + minutes -> UTC Date, using a fixed IST offset. */
const IST_OFFSET_MIN = 330;

export function istDateTimeToUtc(date: string, minutes: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  const utcMs = Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 0, 0, 0) + (minutes - IST_OFFSET_MIN) * 60_000;
  return new Date(utcMs);
}

export function istWeekday(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1)).getUTCDay();
}

export function formatSlotLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const mm = String(minutes % 60).padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${suffix}`;
}

/** Generate open slot start-minutes for one day. */
export function generateSlots(opts: {
  date: string;
  durationMin: number;
  windows: Window[];
  busy: Busy[];
  nowMs: number;
  leadMinutes?: number;
}): number[] {
  const { date, durationMin, windows, busy, nowMs } = opts;
  const lead = opts.leadMinutes ?? 60;
  const earliest = nowMs + lead * 60_000;
  const weekday = istWeekday(date);
  const out: number[] = [];

  for (const w of windows.filter((x) => x.weekday === weekday)) {
    for (let start = w.start_min; start + durationMin <= w.end_min; start += SLOT_STEP_MIN) {
      const startMs = istDateTimeToUtc(date, start).getTime();
      const endMs = startMs + durationMin * 60_000;
      if (startMs < earliest) continue;
      const clash = busy.some((b) => startMs < b.end && endMs > b.start);
      if (clash) continue;
      out.push(start);
    }
  }
  return [...new Set(out)].sort((a, b) => a - b);
}
