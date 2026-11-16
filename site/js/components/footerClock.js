const TARGET_TIMEZONE = "Asia/Manila";

function getTimezoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    timeZoneName: "longOffset",
  });

  const parts = formatter.formatToParts(date);
  const year =
    parts.find((p) => p.type === "year")?.value || date.getFullYear();
  const tzName =
    parts.find((p) => p.type === "timeZoneName")?.value || "GMT+00:00";

  const utcOffset =
    tzName === "GMT" ? "UTC+00:00" : tzName.replace("GMT", "UTC");

  return { year, utcOffset };
}

export function initFooterClock() {
  const clock = document.querySelector("#local-clock-time");
  const clockMeta = document.querySelector("#local-clock-meta");
  const year = document.querySelector("#current-year");

  if (!clock || !clockMeta) return;

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TARGET_TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TARGET_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  function updateClock() {
    const now = new Date();
    const { year: targetYear, utcOffset } = getTimezoneParts(
      now,
      TARGET_TIMEZONE,
    );

    clock.textContent = timeFormatter.format(now);
    clock.dateTime = now.toISOString();

    clockMeta.textContent =
      `${dateFormatter.format(now).toUpperCase()} · ` +
      `${TARGET_TIMEZONE} · ${utcOffset}`;

    if (year) {
      year.textContent = targetYear;
    }
  }

  updateClock();
  window.setInterval(updateClock, 1000);
}
