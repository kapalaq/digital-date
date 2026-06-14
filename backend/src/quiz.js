// Each entry: { country, flag, description, w: { answerValue: points } }
export const COUNTRIES = [
  { country: "Thailand", flag: "🇹🇭", description: "Warm beaches, vibrant street food, easy on the wallet.",
    w: { hot:3, nature:1, mid:2, beach:3, asia:3, beaches:3, food_tours:2, relaxation:2, hidden_gem:1, "4to8":1, try_anything:2 } },
  { country: "Indonesia", flag: "🇮🇩", description: "Bali sunsets, jungle, and surf.",
    w: { hot:3, nature:3, mid:2, beach:3, asia:3, beaches:3, hiking:2, relaxation:2, hidden_gem:2, any:1 } },
  { country: "Vietnam", flag: "🇻🇳", description: "Street food heaven, dramatic coastline, low cost.",
    w: { hot:2, nature:2, budget:3, mid:1, asia:3, food_tours:3, local_markets:2, adventure:2, "4to8":1 } },
  { country: "Japan", flag: "🇯🇵", description: "Culture, food, neon cities and quiet temples.",
    w: { mild:3, city:3, mid:1, luxury:1, asia:3, museums:2, food_tours:3, culture:3, tourist_hotspot:1, english:0 } },
  { country: "Italy", flag: "🇮🇹", description: "Romance, history, and the best food in Europe.",
    w: { mild:3, city:2, mid:2, europe:3, museums:3, food_tours:3, romance:3, history:3, yes:2 } },
  { country: "France", flag: "🇫🇷", description: "Paris romance, wine country, art everywhere.",
    w: { mild:3, city:3, luxury:2, europe:3, museums:3, romance:3, culture:3, tourist_hotspot:2 } },
  { country: "Greece", flag: "🇬🇷", description: "Island beaches plus ancient ruins.",
    w: { hot:2, mild:1, beach:3, europe:3, history:3, beaches:3, romance:2, relaxation:2 } },
  { country: "Spain", flag: "🇪🇸", description: "Beaches, tapas, nightlife, and Gaudí.",
    w: { hot:2, city:2, mid:2, europe:3, beaches:2, nightlife_yes:2, food_tours:2, culture:2 } },
  { country: "Portugal", flag: "🇵🇹", description: "Coastal towns, custard tarts, friendly and affordable.",
    w: { mild:2, hot:1, mid:2, budget:1, europe:3, beach:2, hidden_gem:2, relaxation:2, english:1 } },
  { country: "Iceland", flag: "🇮🇸", description: "Glaciers, waterfalls, northern lights.",
    w: { cold:3, nature:3, luxury:1, europe:2, mountains:2, hiking:3, adventure:3, hidden_gem:2, english:2 } },
  { country: "Switzerland", flag: "🇨🇭", description: "Alps, lakes, postcard mountain towns.",
    w: { cold:2, mild:1, nature:3, luxury:3, europe:3, mountains:3, hiking:3, relaxation:1, english:2 } },
  { country: "Norway", flag: "🇳🇴", description: "Fjords, hiking, dramatic nature.",
    w: { cold:3, nature:3, luxury:2, europe:2, mountains:3, hiking:3, adventure:2, hidden_gem:1, english:2 } },
  { country: "Morocco", flag: "🇲🇦", description: "Markets, desert, and bold flavors.",
    w: { hot:3, city:1, budget:2, mid:1, africa:3, local_markets:3, food_tours:2, adventure:2, hidden_gem:2 } },
  { country: "Egypt", flag: "🇪🇬", description: "Pyramids, the Nile, deep history.",
    w: { hot:3, mid:1, budget:2, africa:2, middle_east:1, history:3, museums:3, culture:2, tourist_hotspot:1 } },
  { country: "Turkey", flag: "🇹🇷", description: "Where Europe meets Asia: bazaars, history, coast.",
    w: { mild:2, hot:1, mid:2, middle_east:2, europe:1, history:3, food_tours:2, local_markets:2, culture:2 } },
  { country: "UAE", flag: "🇦🇪", description: "Luxury, desert adventure, skyline glamour.",
    w: { hot:3, city:3, luxury:3, middle_east:3, shopping:3, nightlife_yes:2, english:2, tourist_hotspot:2 } },
  { country: "USA", flag: "🇺🇸", description: "Anything goes: cities, parks, road trips.",
    w: { mild:1, city:2, mid:1, luxury:1, americas:3, museums:1, shopping:2, english:3, any:1 } },
  { country: "Mexico", flag: "🇲🇽", description: "Beaches, ruins, and incredible food.",
    w: { hot:3, beach:3, budget:1, mid:2, americas:3, beaches:3, food_tours:2, relaxation:2, "4to8":1 } },
  { country: "Peru", flag: "🇵🇪", description: "Machu Picchu, Andes treks, ancient culture.",
    w: { mild:2, nature:2, mid:2, americas:3, mountains:3, hiking:3, history:3, adventure:3, hidden_gem:2 } },
  { country: "New Zealand", flag: "🇳🇿", description: "Epic landscapes, adventure capital of the world.",
    w: { mild:2, cold:1, nature:3, luxury:1, oceania:3, mountains:3, hiking:3, adventure:3, english:3 } },
];

export function scoreQuiz(answers) {
  let best = COUNTRIES[0], bestScore = -1;
  for (const c of COUNTRIES) {
    let score = 0;
    for (const [k, v] of Object.entries(answers)) {
      if (Array.isArray(v)) { for (const item of v) score += c.w[item] || 0; }
      else score += c.w[v] || 0;
    }
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return { country: best.country, flag: best.flag, description: best.description };
}
