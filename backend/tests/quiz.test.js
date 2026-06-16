import { scoreQuiz, COUNTRIES, ANSWER_ATTRS } from "../src/quiz.js";

const beachy = {
  q1: "hot", q2: "nature", q3: "mid", q4: "1week", q5: "beach",
  q6: "a_little", q7: "try_anything", q8: "sometimes", q9: "english",
  q10: "visa_free",
  q11: "asia", q12: ["beaches","food_tours"], q13: "hidden_gem",
  q14: "4to8", q15: "relaxation",
};

const cultural = {
  q1: "mild", q2: "city", q3: "mid", q4: "1week", q5: "mountains",
  q6: "yes", q7: "try_anything", q8: "no", q9: "fine",
  q10: "visa_any", q11: "europe", q12: ["museums","food_tours"], q13: "tourist_hotspot",
  q14: "4to8", q15: "culture",
};

const luxuryBeach = {
  q1: "hot", q2: "nature", q3: "luxury", q4: "2weeks", q5: "beach",
  q6: "no", q7: "some_restrictions", q8: "no", q9: "english",
  q10: "visa_free", q11: "oceania", q12: ["beaches"], q13: "hidden_gem",
  q14: "any", q15: "relaxation",
};

test("returns correct result shape", () => {
  const r = scoreQuiz(beachy);
  expect(r).toHaveProperty("country");
  expect(r).toHaveProperty("flag");
  expect(r).toHaveProperty("description");
});

test("deterministic for same input", () => {
  expect(scoreQuiz(beachy).country).toBe(scoreQuiz(beachy).country);
});

test("hot + beach + asia leans tropical Asia", () => {
  const r = scoreQuiz(beachy);
  expect(["Thailand","Indonesia","Vietnam","Philippines"]).toContain(r.country);
});

test("culture + history + europe leans cultural Europe", () => {
  const r = scoreQuiz(cultural);
  expect(["France","Italy","Czech Republic","Austria","Greece"]).toContain(r.country);
});

test("luxury + beach + oceania leans Maldives or Tahiti", () => {
  const r = scoreQuiz(luxuryBeach);
  expect(["Maldives","Tahiti","Fiji"]).toContain(r.country);
});

test("COUNTRIES has exactly 50 entries", () => {
  expect(COUNTRIES).toHaveLength(50);
});

test("every country has all 12 attr dimensions", () => {
  const dims = ["beach","nature","mountains","city","culture","history","food","adventure","nightlife","budget","luxury","english"];
  for (const c of COUNTRIES) {
    for (const d of dims) {
      expect(c.attrs).toHaveProperty(d);
    }
  }
});

test("ANSWER_ATTRS covers all answer values used in questions", () => {
  const knownValues = [
    "hot","mild","cold","nature","city","budget","mid","luxury",
    "weekend","1week","2weeks","beach","mountains","yes","a_little","no",
    "try_anything","some_restrictions","familiar","nightlife_yes","sometimes",
    "fine","english","visa_free","visa_any",
    "europe","asia","americas","middle_east","africa","oceania",
    "hiking","museums","beaches","shopping","local_markets","food_tours",
    "tourist_hotspot","hidden_gem","under4","4to8","any",
    "romance","adventure","relaxation","culture",
  ];
  for (const v of knownValues) {
    expect(ANSWER_ATTRS).toHaveProperty(v);
  }
});
