import { canSubmitGoals, buildGoalsMarkdown } from "../src/goals.js";

test("needs 100 goals unless partner allowed fewer", () => {
  expect(canSubmitGoals(new Array(99).fill("g"), false)).toBe(false);
  expect(canSubmitGoals(new Array(100).fill("g"), false)).toBe(true);
  expect(canSubmitGoals(["one"], true)).toBe(true);
  expect(canSubmitGoals([], true)).toBe(false); // still need >=1
});

test("markdown format", () => {
  const md = buildGoalsMarkdown("User A", ["Run a marathon","Learn piano"], "2026-06-15");
  expect(md).toBe(
    "# My 100 Goals — User A — 2026-06-15\n\n1. Run a marathon\n2. Learn piano\n"
  );
});
