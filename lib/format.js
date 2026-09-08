export const CAMPAIGN_STATUS_LABEL = {
  READY: "配信前",
  REHEARSAL: "リハーサル中",
  ONAIR: "配信中",
  ENDED: "終了",
};

export const CAMPAIGN_STATUS_CHIP = {
  READY: "chip-scheduled",
  REHEARSAL: "chip-scheduled",
  ONAIR: "chip-live",
  ENDED: "chip-ended",
};

export function formatDateTime(iso) {
  if (!iso) return "未定";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toIsoFromLocalInput(value) {
  // <input type="datetime-local"> gives "YYYY-MM-DDTHH:mm" in local time.
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function toLocalInputFromIso(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
