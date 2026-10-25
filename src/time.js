export const TIME_ZONE = "America/Los_Angeles";
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

// Difference (ms) between Pacific wall-clock time and UTC at a given instant
function pacificOffset(timestamp) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
      .formatToParts(timestamp)
      .map(({ type, value }) => [type, Number(value)])
  );
  const wall = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return wall - (timestamp - (timestamp % 1000));
}

// "10/20/2026" + "2:30 PM" (Pacific) -> Date
export function parsePacific(date, time) {
  const d = String(date).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const t = String(time).trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!d || !t) {
    throw new Error(`Couldn't read "${date} ${time}". Use MM/DD/YYYY and h:mm AM/PM.`);
  }
  let hour = Number(t[1]) % 12;
  if (t[3].toUpperCase() === "PM") hour += 12;
  const wall = Date.UTC(Number(d[3]), Number(d[1]) - 1, Number(d[2]), hour, Number(t[2]));
  // Two passes so times near a DST switch land on the right offset
  const guess = wall - pacificOffset(wall);
  return new Date(wall - pacificOffset(guess));
}

export function splitDuration(ms) {
  const elapsed = Math.max(0, ms);
  return {
    days: Math.floor(elapsed / DAY),
    hours: Math.floor((elapsed % DAY) / HOUR),
    minutes: Math.floor((elapsed % HOUR) / MINUTE),
    seconds: Math.floor((elapsed % MINUTE) / SECOND),
  };
}

export function formatDuration(ms) {
  const { days, hours, minutes } = splitDuration(ms);
  return `${days}d ${hours}h ${minutes}m`;
}
