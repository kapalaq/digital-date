export function canSubmitGoals(goals, partnerAllowFewer) {
  if (goals.length === 0) return false;
  if (partnerAllowFewer) return true;
  return goals.length >= 100;
}

export function buildGoalsMarkdown(username, goals, date) {
  const lines = goals.map((g, i) => `${i + 1}. ${g}`).join("\n");
  return `# My 100 Goals — ${username} — ${date}\n\n${lines}\n`;
}
