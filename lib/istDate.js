// India-time (IST, UTC+5:30) day/month boundaries.
// The server runs in UTC, so `new Date(y, m, 1)` there means 5:30 AM IST — orders placed
// between midnight and 5:30 AM were counted in the previous day/month on the dashboard.

const IST_OFFSET_MS = 330 * 60 * 1000;
export const IST_TZ = "Asia/Kolkata";

function istParts(date = new Date()) {
  const t = new Date(date.getTime() + IST_OFFSET_MS);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth(), day: t.getUTCDate() };
}

/** Current IST calendar year and 1-based month. */
export function istYearMonth(date = new Date()) {
  const p = istParts(date);
  return { year: p.year, month: p.month + 1 };
}

/** Start of the IST day, `offsetDays` from today (0 = today, -1 = yesterday). */
export function istDayStart(offsetDays = 0) {
  const p = istParts();
  return new Date(Date.UTC(p.year, p.month, p.day + offsetDays) - IST_OFFSET_MS);
}

/** Start of an IST month given year and 1-based month (month may overflow, e.g. 13). */
export function istMonthStartOf(year, month1) {
  return new Date(Date.UTC(year, month1 - 1, 1) - IST_OFFSET_MS);
}

/** Start of the IST month, `offsetMonths` from this month (0 = this month, -1 = last month). */
export function istMonthStart(offsetMonths = 0) {
  const p = istParts();
  return new Date(Date.UTC(p.year, p.month + offsetMonths, 1) - IST_OFFSET_MS);
}
