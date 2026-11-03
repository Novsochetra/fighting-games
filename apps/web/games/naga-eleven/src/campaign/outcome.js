export const goalsOf = (value) => Math.max(0, Math.floor(Number(value) || 0));

export function outcomeOf(result) {
  const goalsFor = goalsOf(result.goalsFor);
  const goalsAgainst = goalsOf(result.goalsAgainst);

  if (goalsFor === goalsAgainst) {
    return 'draw';
  }

  return goalsFor > goalsAgainst ? 'win' : 'lose';
}

// the shoot-out may report a plain won flag or its own score
export function penaltiesWon(penalties) {
  if (typeof penalties === 'boolean') {
    return penalties;
  }

  return goalsOf(penalties?.goalsFor) > goalsOf(penalties?.goalsAgainst);
}

export function afterScene(stage, outcome) {
  const after = stage.after ?? {};

  return (outcome === 'draw' ? (after.draw ?? after.lose) : after[outcome]) ?? null;
}

export const unlockedOf = (result) => [result?.unlocked ?? []].flat();
