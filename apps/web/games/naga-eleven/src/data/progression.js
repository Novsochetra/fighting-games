// Tuned so a player who plays every stage once reaches about level 40 by the World Championship
// final; test/integration/campaign/full-length.test.js plays a campaign of the story's shape through.
export const MAX_LEVEL = 50;

// the XP from level n to level n + 1 is base + step * n
export const LEVEL_CURVE = { base: 20, step: 10 };

// a player who skipped trainings or lost often is lifted to this level as the chapter starts
export const CHAPTER_MIN_LEVEL = { 1: 1, 2: 8, 3: 17, 4: 27 };

// each level costs more than the last, so later chapters pay more for the same play
export const CHAPTER_XP_SCALE = { 1: 1, 2: 2, 3: 3, 4: 3.9 };

export const MATCH_XP = {
  win: 85,
  draw: 50,
  lose: 25,
  goal: 10,
  maxGoals: 6,
  heroGoal: 16,
  maxHeroGoals: 5,
  duel: 8,
  maxDuels: 10,
};

export const GRADE_XP = { S: 110, A: 85, B: 60, C: 35 };

export const LOWEST_GRADE = 'C';

// drills score on scales of their own and the grade already says how well it went, so the score
// adds a little that flattens out: half of maxBonus at a score of half
export const SCORE_XP = { maxBonus: 20, half: 1500 };

export const HERO_START = {
  stats: { speed: 46, shot: 48, pass: 38, dribble: 46, tackle: 26, keeping: 10, stamina: 40 },
  moves: ['power-shot'],
  spiritMax: 100,
};

// points a level: a forward's gift grows fastest in shot, dribble and speed
export const STAT_GROWTH = {
  speed: 1,
  shot: 1.05,
  pass: 0.85,
  dribble: 1.05,
  tackle: 0.5,
  keeping: 0.2,
  stamina: 1,
};

// the gauge is about 100 (src/data/moves.js prices specials against it), so it grows slowly
export const SPIRIT_GROWTH = 0.8;

export const STAT_LIMITS = { min: 1, max: 99 };

// points a grade step adds to what the drill trains
export const DRILL_GROWTH = {
  'cone-dribble': { dribble: 1, speed: 1 },
  'target-shot': { shot: 1, pass: 1 },
  'spirit-focus': { stamina: 1, spiritMax: 2 },
};

export const GRADE_STEPS = { S: 3, A: 2, B: 1, C: 0 };
