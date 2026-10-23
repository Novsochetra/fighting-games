// a ration heals a flat 10 on every difficulty for now, while weapon crates are off
export const DIFFICULTIES = [
  { name: 'Easy', damage: 0.6, tokens: 1, cooldown: 1.45, heal: 10 },
  { name: 'Normal', damage: 1, tokens: 2, cooldown: 1, heal: 10 },
  { name: 'Hard', damage: 1.35, tokens: 3, cooldown: 0.75, heal: 10 },
];

export function difficultyOf(settings) {
  return DIFFICULTIES[settings.difficulty] || DIFFICULTIES[1];
}
