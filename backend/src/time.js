// 18:00 in GMT+5 == 13:00 UTC.
export function nextSixPmGmtPlus5(now = new Date()) {
  const target = new Date(now);
  target.setUTCHours(13, 0, 0, 0);
  if (now.getTime() >= target.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  return target;
}
