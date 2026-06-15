function parseDateStartHourUTC() {
  const raw = process.env.DATE_START_TIME_GMT ?? "1300";
  const h = Math.floor(parseInt(raw, 10) / 100);
  const m = parseInt(raw, 10) % 100;
  return { h, m };
}

// 18:00 in GMT+1 == 17:00 UTC.
export function nextSixPmGmtPlus5(now = new Date()) {
  const { h, m } = parseDateStartHourUTC();
  const target = new Date(now);
  target.setUTCHours(h, m, 0, 0);
  if (now.getTime() >= target.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target;
}
