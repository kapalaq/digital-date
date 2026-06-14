import { nextSixPmGmtPlus5 } from "../src/time.js";

test("returns today 18:00 GMT+5 when now is before it", () => {
  // 2026-06-15 10:00 GMT+5 == 2026-06-15T05:00:00Z
  const now = new Date("2026-06-15T05:00:00Z");
  const r = nextSixPmGmtPlus5(now);
  expect(r.toISOString()).toBe("2026-06-15T13:00:00.000Z"); // 18:00 GMT+5
});

test("rolls to next day when now is after 18:00 GMT+5", () => {
  const now = new Date("2026-06-15T14:00:00Z"); // 19:00 GMT+5
  const r = nextSixPmGmtPlus5(now);
  expect(r.toISOString()).toBe("2026-06-16T13:00:00.000Z");
});
