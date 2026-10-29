const asText = (value) => (typeof value === 'string' ? value.trim() : '');

// A game with an online leaderboard names in the catalog what its board shows: its heroes and what
// each is called, and its difficulties' names, easiest first. The catalog is data, so a board with
// neither is no board.
export function boardOf(rules) {
  if (!Array.isArray(rules?.heroes) || !Array.isArray(rules.difficulties)) {
    return null;
  }

  const heroes = rules.heroes
    .filter((hero) => asText(hero?.id) && asText(hero?.name))
    .map((hero) => [asText(hero.id), asText(hero.name)]);

  return { heroes: Object.fromEntries(heroes), difficulties: rules.difficulties.map(asText) };
}
