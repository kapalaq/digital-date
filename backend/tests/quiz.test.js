import { scoreQuiz } from "../src/quiz.js";

const beachy = {
  q1: "hot", q2: "nature", q3: "mid", q4: "1week", q5: "beach",
  q6: "a_little", q7: "try_anything", q8: "sometimes", q9: "english",
  q10: "yes", q11: "asia", q12: ["beaches","food_tours"], q13: "hidden_gem",
  q14: "4to8", q15: "relaxation",
};

test("returns a country result object", () => {
  const r = scoreQuiz(beachy);
  expect(r).toHaveProperty("country");
  expect(r).toHaveProperty("flag");
  expect(r).toHaveProperty("description");
});

test("deterministic for same input", () => {
  expect(scoreQuiz(beachy).country).toBe(scoreQuiz(beachy).country);
});

test("hot+beach+asia leans tropical asia", () => {
  // Thailand/Bali-type result expected from the table weighting
  const r = scoreQuiz(beachy);
  expect(["Thailand","Indonesia","Vietnam","Philippines"]).toContain(r.country);
});
