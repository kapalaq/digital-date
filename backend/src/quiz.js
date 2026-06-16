// Each country: attrs scored 0–3 across 12 dimensions
// Dimensions: beach, nature, mountains, city, culture, history,
//             food, adventure, nightlife, budget, luxury, english
export const COUNTRIES = [
  // ── EUROPE (14) ──────────────────────────────────────────────
  { country:"France",          flag:"🇫🇷", region:"europe",
    description:"Paris romance, wine country, art and food everywhere.",
    attrs:{ beach:1, nature:1, mountains:1, city:2, culture:3, history:3, food:3, adventure:1, nightlife:1, budget:0, luxury:2, english:1 } },
  { country:"Italy",           flag:"🇮🇹", region:"europe",
    description:"Romance, history, and the best food in Europe.",
    attrs:{ beach:2, nature:1, mountains:1, city:2, culture:3, history:3, food:3, adventure:1, nightlife:2, budget:1, luxury:2, english:1 } },
  { country:"Spain",           flag:"🇪🇸", region:"europe",
    description:"Beaches, tapas, electrifying nightlife, and Gaudí.",
    attrs:{ beach:3, nature:1, mountains:1, city:2, culture:2, history:2, food:2, adventure:1, nightlife:3, budget:1, luxury:1, english:1 } },
  { country:"Portugal",        flag:"🇵🇹", region:"europe",
    description:"Coastal towns, custard tarts, friendly and affordable.",
    attrs:{ beach:2, nature:1, mountains:0, city:1, culture:2, history:2, food:2, adventure:1, nightlife:1, budget:2, luxury:0, english:2 } },
  { country:"Greece",          flag:"🇬🇷", region:"europe",
    description:"Island beaches, ancient ruins, and golden sunsets.",
    attrs:{ beach:3, nature:1, mountains:1, city:1, culture:2, history:3, food:2, adventure:1, nightlife:1, budget:1, luxury:1, english:2 } },
  { country:"Iceland",         flag:"🇮🇸", region:"europe",
    description:"Glaciers, waterfalls, northern lights — raw nature.",
    attrs:{ beach:0, nature:3, mountains:2, city:0, culture:1, history:1, food:1, adventure:3, nightlife:0, budget:0, luxury:1, english:3 } },
  { country:"Switzerland",     flag:"🇨🇭", region:"europe",
    description:"Alps, lakes, and postcard-perfect mountain towns.",
    attrs:{ beach:0, nature:3, mountains:3, city:1, culture:2, history:1, food:2, adventure:2, nightlife:1, budget:0, luxury:3, english:2 } },
  { country:"Norway",          flag:"🇳🇴", region:"europe",
    description:"Fjords, midnight sun, and dramatic hiking.",
    attrs:{ beach:0, nature:3, mountains:3, city:1, culture:1, history:1, food:1, adventure:3, nightlife:0, budget:0, luxury:2, english:3 } },
  { country:"Croatia",         flag:"🇭🇷", region:"europe",
    description:"Adriatic coastline, Game of Thrones towns, affordable.",
    attrs:{ beach:3, nature:2, mountains:1, city:1, culture:2, history:2, food:2, adventure:1, nightlife:2, budget:2, luxury:0, english:2 } },
  { country:"Czech Republic",  flag:"🇨🇿", region:"europe",
    description:"Fairytale Prague, medieval castles, cheap beer.",
    attrs:{ beach:0, nature:1, mountains:0, city:2, culture:3, history:3, food:2, adventure:0, nightlife:2, budget:2, luxury:0, english:2 } },
  { country:"Austria",         flag:"🇦🇹", region:"europe",
    description:"Vienna's imperial grandeur, Alpine ski resorts.",
    attrs:{ beach:0, nature:2, mountains:2, city:2, culture:3, history:3, food:2, adventure:1, nightlife:1, budget:0, luxury:2, english:2 } },
  { country:"Netherlands",     flag:"🇳🇱", region:"europe",
    description:"Amsterdam canals, museums, cycling culture.",
    attrs:{ beach:1, nature:1, mountains:0, city:2, culture:2, history:2, food:1, adventure:0, nightlife:2, budget:1, luxury:1, english:3 } },
  { country:"Scotland",        flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", region:"europe",
    description:"Highland drama, whisky, and brooding castles.",
    attrs:{ beach:0, nature:3, mountains:2, city:1, culture:2, history:3, food:1, adventure:2, nightlife:1, budget:1, luxury:0, english:3 } },
  { country:"Malta",           flag:"🇲🇹", region:"europe",
    description:"Ancient temples, crystal-clear seas, English-speaking.",
    attrs:{ beach:3, nature:1, mountains:0, city:1, culture:2, history:3, food:2, adventure:1, nightlife:1, budget:1, luxury:1, english:3 } },

  // ── ASIA (12) ────────────────────────────────────────────────
  { country:"Thailand",        flag:"🇹🇭", region:"asia",
    description:"Warm beaches, vibrant street food, easy on the wallet.",
    attrs:{ beach:3, nature:1, mountains:1, city:1, culture:2, history:1, food:3, adventure:2, nightlife:2, budget:3, luxury:1, english:1 } },
  { country:"Japan",           flag:"🇯🇵", region:"asia",
    description:"Culture, food, neon cities and quiet temples.",
    attrs:{ beach:1, nature:2, mountains:2, city:3, culture:3, history:3, food:3, adventure:1, nightlife:2, budget:1, luxury:1, english:0 } },
  { country:"Indonesia",       flag:"🇮🇩", region:"asia",
    description:"Bali sunsets, jungle temples, and surf.",
    attrs:{ beach:3, nature:3, mountains:2, city:0, culture:2, history:1, food:2, adventure:2, nightlife:1, budget:2, luxury:1, english:1 } },
  { country:"Vietnam",         flag:"🇻🇳", region:"asia",
    description:"Street food heaven, dramatic coastline, low cost.",
    attrs:{ beach:2, nature:2, mountains:2, city:1, culture:2, history:2, food:3, adventure:2, nightlife:1, budget:3, luxury:0, english:1 } },
  { country:"India",           flag:"🇮🇳", region:"asia",
    description:"Epic culture, spice markets, ancient wonders.",
    attrs:{ beach:2, nature:2, mountains:2, city:2, culture:3, history:3, food:3, adventure:2, nightlife:1, budget:2, luxury:1, english:2 } },
  { country:"Sri Lanka",       flag:"🇱🇰", region:"asia",
    description:"Tea hills, wildlife, beaches, and Buddhist temples.",
    attrs:{ beach:2, nature:3, mountains:2, city:0, culture:2, history:2, food:2, adventure:2, nightlife:0, budget:2, luxury:1, english:2 } },
  { country:"Cambodia",        flag:"🇰🇭", region:"asia",
    description:"Angkor Wat and the world's most photogenic ruins.",
    attrs:{ beach:1, nature:2, mountains:0, city:1, culture:2, history:3, food:2, adventure:1, nightlife:1, budget:3, luxury:0, english:1 } },
  { country:"Singapore",       flag:"🇸🇬", region:"asia",
    description:"Ultramodern city-state, world-class food, zero hassle.",
    attrs:{ beach:1, nature:0, mountains:0, city:3, culture:2, history:1, food:3, adventure:0, nightlife:2, budget:0, luxury:2, english:3 } },
  { country:"South Korea",     flag:"🇰🇷", region:"asia",
    description:"K-culture, incredible street food, buzzing Seoul.",
    attrs:{ beach:1, nature:1, mountains:1, city:3, culture:3, history:2, food:3, adventure:1, nightlife:2, budget:1, luxury:1, english:1 } },
  { country:"Nepal",           flag:"🇳🇵", region:"asia",
    description:"Himalayan trekking, monasteries, raw adventure.",
    attrs:{ beach:0, nature:3, mountains:3, city:0, culture:2, history:1, food:1, adventure:3, nightlife:0, budget:2, luxury:0, english:1 } },
  { country:"Philippines",     flag:"🇵🇭", region:"asia",
    description:"7,000 islands, white sand, warm English-speaking locals.",
    attrs:{ beach:3, nature:2, mountains:1, city:1, culture:1, history:1, food:2, adventure:2, nightlife:2, budget:2, luxury:0, english:3 } },
  { country:"Georgia",         flag:"🇬🇪", region:"asia",
    description:"Caucasus mountains, legendary wine, superb food, cheap.",
    attrs:{ beach:1, nature:2, mountains:2, city:1, culture:2, history:2, food:3, adventure:2, nightlife:1, budget:3, luxury:0, english:1 } },

  // ── AMERICAS (8) ─────────────────────────────────────────────
  { country:"Mexico",          flag:"🇲🇽", region:"americas",
    description:"Beaches, ancient ruins, and incredible food.",
    attrs:{ beach:3, nature:1, mountains:1, city:1, culture:2, history:2, food:3, adventure:2, nightlife:2, budget:2, luxury:1, english:0 } },
  { country:"Peru",            flag:"🇵🇪", region:"americas",
    description:"Machu Picchu, Andes treks, ancient Inca culture.",
    attrs:{ beach:0, nature:2, mountains:3, city:1, culture:2, history:3, food:2, adventure:3, nightlife:0, budget:2, luxury:0, english:1 } },
  { country:"USA",             flag:"🇺🇸", region:"americas",
    description:"Anything goes: cities, national parks, road trips.",
    attrs:{ beach:2, nature:3, mountains:2, city:2, culture:1, history:1, food:2, adventure:2, nightlife:2, budget:1, luxury:2, english:3 } },
  { country:"Colombia",        flag:"🇨🇴", region:"americas",
    description:"Coffee hills, Caribbean coast, Bogotá culture.",
    attrs:{ beach:2, nature:2, mountains:2, city:2, culture:2, history:1, food:2, adventure:2, nightlife:2, budget:2, luxury:0, english:0 } },
  { country:"Argentina",       flag:"🇦🇷", region:"americas",
    description:"Patagonia, tango, wine, and world-class steak.",
    attrs:{ beach:1, nature:2, mountains:3, city:2, culture:2, history:1, food:3, adventure:2, nightlife:2, budget:2, luxury:0, english:0 } },
  { country:"Costa Rica",      flag:"🇨🇷", region:"americas",
    description:"Rainforest, volcanoes, wildlife, and surf.",
    attrs:{ beach:2, nature:3, mountains:2, city:0, culture:1, history:0, food:1, adventure:3, nightlife:0, budget:2, luxury:1, english:2 } },
  { country:"Brazil",          flag:"🇧🇷", region:"americas",
    description:"Carnival, Amazon, beaches, and samba nights.",
    attrs:{ beach:3, nature:3, mountains:1, city:2, culture:2, history:1, food:2, adventure:2, nightlife:3, budget:2, luxury:1, english:0 } },
  { country:"Cuba",            flag:"🇨🇺", region:"americas",
    description:"Vintage cars, salsa, cigars, and turquoise coast.",
    attrs:{ beach:3, nature:1, mountains:0, city:1, culture:3, history:2, food:2, adventure:1, nightlife:2, budget:2, luxury:0, english:0 } },

  // ── MIDDLE EAST (5) ──────────────────────────────────────────
  { country:"UAE",             flag:"🇦🇪", region:"middle_east",
    description:"Luxury skyline, desert adventure, world-class shopping.",
    attrs:{ beach:1, nature:0, mountains:0, city:3, culture:2, history:1, food:2, adventure:1, nightlife:2, budget:0, luxury:3, english:2 } },
  { country:"Turkey",          flag:"🇹🇷", region:"middle_east",
    description:"Where Europe meets Asia: bazaars, history, and coast.",
    attrs:{ beach:2, nature:1, mountains:1, city:2, culture:3, history:3, food:3, adventure:1, nightlife:1, budget:2, luxury:1, english:1 } },
  { country:"Jordan",          flag:"🇯🇴", region:"middle_east",
    description:"Petra, Wadi Rum desert, Dead Sea — ancient and wild.",
    attrs:{ beach:1, nature:1, mountains:1, city:1, culture:2, history:3, food:2, adventure:2, nightlife:0, budget:1, luxury:1, english:2 } },
  { country:"Oman",            flag:"🇴🇲", region:"middle_east",
    description:"Desert dunes, mountain forts, unspoiled coastline.",
    attrs:{ beach:2, nature:2, mountains:1, city:1, culture:2, history:2, food:1, adventure:2, nightlife:0, budget:0, luxury:2, english:2 } },
  { country:"Israel",          flag:"🇮🇱", region:"middle_east",
    description:"Jerusalem's depth, Tel Aviv beaches, extraordinary food.",
    attrs:{ beach:2, nature:1, mountains:0, city:2, culture:3, history:3, food:3, adventure:1, nightlife:1, budget:1, luxury:1, english:3 } },

  // ── AFRICA (6) ───────────────────────────────────────────────
  { country:"Morocco",         flag:"🇲🇦", region:"africa",
    description:"Medinas, Sahara dunes, and bold flavors.",
    attrs:{ beach:1, nature:2, mountains:1, city:1, culture:3, history:2, food:2, adventure:2, nightlife:0, budget:2, luxury:0, english:0 } },
  { country:"Egypt",           flag:"🇪🇬", region:"africa",
    description:"Pyramids, the Nile, and five thousand years of history.",
    attrs:{ beach:2, nature:0, mountains:0, city:1, culture:2, history:3, food:1, adventure:1, nightlife:0, budget:2, luxury:1, english:1 } },
  { country:"Tanzania",        flag:"🇹🇿", region:"africa",
    description:"Serengeti safari, Zanzibar beaches, Kilimanjaro.",
    attrs:{ beach:2, nature:3, mountains:2, city:0, culture:1, history:0, food:1, adventure:3, nightlife:0, budget:1, luxury:2, english:2 } },
  { country:"South Africa",    flag:"🇿🇦", region:"africa",
    description:"Safari, Cape Town coast, wine valleys, and vibrant cities.",
    attrs:{ beach:2, nature:3, mountains:2, city:2, culture:2, history:1, food:2, adventure:3, nightlife:1, budget:1, luxury:1, english:3 } },
  { country:"Kenya",           flag:"🇰🇪", region:"africa",
    description:"Great Migration, Maasai culture, Indian Ocean beach.",
    attrs:{ beach:1, nature:3, mountains:2, city:0, culture:1, history:0, food:1, adventure:3, nightlife:0, budget:1, luxury:1, english:3 } },
  { country:"Tunisia",         flag:"🇹🇳", region:"africa",
    description:"Roman ruins, Sahara edge, and Mediterranean beaches.",
    attrs:{ beach:2, nature:1, mountains:0, city:1, culture:2, history:3, food:2, adventure:1, nightlife:0, budget:2, luxury:0, english:0 } },

  // ── OCEANIA (5) ──────────────────────────────────────────────
  { country:"New Zealand",     flag:"🇳🇿", region:"oceania",
    description:"Epic landscapes, adventure capital of the world.",
    attrs:{ beach:2, nature:3, mountains:3, city:1, culture:1, history:0, food:2, adventure:3, nightlife:0, budget:0, luxury:1, english:3 } },
  { country:"Australia",       flag:"🇦🇺", region:"oceania",
    description:"Outback, Great Barrier Reef, cosmopolitan cities.",
    attrs:{ beach:2, nature:3, mountains:1, city:2, culture:1, history:0, food:2, adventure:2, nightlife:2, budget:0, luxury:1, english:3 } },
  { country:"Fiji",            flag:"🇫🇯", region:"oceania",
    description:"Overwater bungalows, coral reefs, pure island bliss.",
    attrs:{ beach:3, nature:2, mountains:0, city:0, culture:1, history:0, food:1, adventure:1, nightlife:0, budget:1, luxury:2, english:3 } },
  { country:"Maldives",        flag:"🇲🇻", region:"oceania",
    description:"Luxury overwater villas, turquoise atolls, total escape.",
    attrs:{ beach:3, nature:1, mountains:0, city:0, culture:0, history:0, food:1, adventure:0, nightlife:0, budget:0, luxury:3, english:2 } },
  { country:"Tahiti",          flag:"🇵🇫", region:"oceania",
    description:"French Polynesian romance, black-sand beaches, lagoons.",
    attrs:{ beach:3, nature:2, mountains:1, city:0, culture:1, history:0, food:2, adventure:1, nightlife:0, budget:0, luxury:3, english:1 } },
];

// Maps each quiz answer value → attribute weights.
// null = informational only (no scoring effect).
export const ANSWER_ATTRS = {
  // q1 climate
  hot:              { beach: 1, nature: 0.5 },
  mild:             { culture: 0.5, city: 0.5 },
  cold:             { mountains: 1.5, nature: 1 },
  // q2 nature vs city
  nature:           { nature: 2, mountains: 0.5 },
  city:             { city: 2, nightlife: 0.5 },
  // q3 budget
  budget:           { budget: 3 },
  mid:              { budget: 1 },
  luxury:           { luxury: 3 },
  // q4 trip duration — informational
  weekend:          null,
  "1week":          null,
  "2weeks":         null,
  // q5 beach vs mountains
  beach:            { beach: 3 },
  mountains:        { mountains: 3, adventure: 1 },
  // q6 historical interest
  yes:              { history: 2, culture: 1 },
  a_little:         { history: 1 },
  no:               null,
  // q7 food adventurousness
  try_anything:     { food: 3 },
  some_restrictions:{ food: 1 },
  familiar:         null,
  // q8 nightlife
  nightlife_yes:    { nightlife: 3 },
  sometimes:        { nightlife: 1 },
  // q9 language tolerance
  fine:             { adventure: 0.5 },
  english:          { english: 2 },
  // q10 visa (renamed values — informational)
  visa_free:        null,
  visa_any:         null,
  // q11 region — handled as +10 bonus on matching c.region, not attr vector
  europe:           null,
  asia:             null,
  americas:         null,
  middle_east:      null,
  africa:           null,
  oceania:          null,
  // q12 activities (multi-select)
  hiking:           { mountains: 2, nature: 2, adventure: 2 },
  museums:          { culture: 2, history: 2 },
  beaches:          { beach: 3 },
  shopping:         { city: 1, luxury: 1 },
  local_markets:    { culture: 2, food: 1, adventure: 1 },
  food_tours:       { food: 3, culture: 1 },
  // q13 crowd
  tourist_hotspot:  { city: 0.5 },
  hidden_gem:       { nature: 0.5, adventure: 0.5 },
  // q14 flight duration — informational
  under4:           null,
  "4to8":           null,
  any:              null,
  // q15 most important factor
  romance:          { beach: 1, luxury: 1, culture: 1 },
  adventure:        { adventure: 3, mountains: 1, nature: 1 },
  relaxation:       { beach: 2, nature: 1 },
  culture:          { culture: 3, history: 2 },
};

const REGION_KEYS = new Set(["europe","asia","americas","middle_east","africa","oceania"]);

export function scoreQuiz(answers, exclusions = new Set()) {
  const desire = {};
  const preferredRegions = [];

  for (const val of _flatten(answers)) {
    if (REGION_KEYS.has(val)) { preferredRegions.push(val); continue; }
    const attrs = ANSWER_ATTRS[val];
    if (!attrs) continue;
    for (const [k, w] of Object.entries(attrs)) {
      desire[k] = (desire[k] || 0) + w;
    }
  }

  const candidates = exclusions.size > 0
    ? COUNTRIES.filter(c => !exclusions.has(c.country))
    : COUNTRIES;
  const pool = candidates.length > 0 ? candidates : COUNTRIES;

  let best = pool[0], bestScore = -1;
  for (const c of pool) {
    let score = 0;
    for (const [k, v] of Object.entries(desire)) {
      score += (c.attrs[k] || 0) * v;
    }
    if (preferredRegions.length > 0 && preferredRegions.some(r => c.region === r)) {
      score += 10;
    }
    if (score > bestScore) { bestScore = score; best = c; }
  }

  return { country: best.country, flag: best.flag, description: best.description };
}

function _flatten(answers) {
  const vals = [];
  for (const v of Object.values(answers)) {
    if (Array.isArray(v)) vals.push(...v); else vals.push(v);
  }
  return vals;
}
