// how long each part of a cut-in runs, in ticks
export const STAGE_TICKS = {
  intro: 24,
  versus: 64,
  cutin: 64,
  clash: 96,
  saveCam: 96,
  result: 84,
  through: 36,
  outro: 24,
};

// the moment in a clash the two moves meet
export const IMPACT_TICK = 54;

// the splash settles before the menu opens over it
export const MENU_AFTER = 26;

export const SHAKE = { impact: 14, landing: 6 };

// a cut-in or a versus seen before in the match plays at this share of its length
export const REPEAT_SHARE = 0.5;
