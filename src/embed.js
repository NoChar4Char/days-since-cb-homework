// Builds the <meta> tags Discord (and other sites) read for link previews.
// Link-preview crawlers don't run JavaScript, so these are baked into
// index.html at build time with the timer as of that moment.
import { TIME_ZONE, parsePacific, splitDuration } from "./time.js";

const NAMED_COLORS = {
  red: "#ff0000",
  orange: "#ffa500",
  yellow: "#ffff00",
  green: "#008000",
  lime: "#00ff00",
  blue: "#0000ff",
  purple: "#800080",
  pink: "#ffc0cb",
  white: "#ffffff",
  black: "#000000",
  gray: "#808080",
  grey: "#808080",
};

// Discord's embed color only understands hex, so translate simple names
function toHex(color) {
  if (!color) return undefined;
  const value = String(color).trim().toLowerCase();
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/.test(value)) return value;
  return NAMED_COLORS[value];
}

const escape = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function embedTags(data, { now = Date.now(), url } = {}) {
  const times = data.history
    .map((entry) => parsePacific(entry.date, entry.time).getTime())
    .sort((a, b) => a - b);
  const first = times[0];

  let description = data.noHistoryText;
  let color;
  if (first != null) {
    const { days, hours, minutes } = splitDuration(now - first);
    const levels = [...data.statusLevels].sort((a, b) => a.minDays - b.minDays);
    const level = levels.filter((l) => days >= l.minDays).pop();
    const asOf = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(now);
    description =
      `⏱️ ${days}d ${hours}h ${minutes}m — ${data.headline}` +
      (level?.label ? `\nStatus: ${level.label}` : "") +
      `\nIncidents logged: ${times.length} · as of ${asOf} PT`;
    color = toHex(level?.["color-all"]);
  }

  const tags = [
    ["property", "og:type", "website"],
    ["property", "og:site_name", data.systemLabel],
    ["property", "og:title", data.title],
    ["property", "og:description", description],
    ["name", "description", description],
    ["name", "theme-color", color],
    ["property", "og:url", url],
  ];
  return tags
    .filter(([, , content]) => content)
    .map(([attr, key, content]) => `<meta ${attr}="${key}" content="${escape(content)}">`)
    .join("\n  ");
}
