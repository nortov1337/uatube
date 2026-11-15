const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

export function formatViews(views: number): string {
  if (views < 1000) return String(views);
  if (views < 1_000_000) return `${numberFormat.format(views / 1000)} тыс.`;
  return `${numberFormat.format(views / 1_000_000)} млн`;
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

export function formatBytes(bytes: number): string {
  const units = ["Б", "КБ", "МБ", "ГБ"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${numberFormat.format(value)} ${units[unitIndex]}`;
}

const monthYearFormat = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });

export function formatMonthYear(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return monthYearFormat.format(date);
}

const relativeFormat = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });

const STEPS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

export function timeAgo(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);

  for (const [unit, seconds] of STEPS) {
    if (abs >= seconds) {
      return relativeFormat.format(Math.round(diffSec / seconds), unit);
    }
  }
  return relativeFormat.format(diffSec, "second");
}
