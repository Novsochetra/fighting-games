// what fallen raiders and bosses leave on the road, and what it is worth
export const LOOT_VALUES = {
  coin: { coins: 1, score: 10 },
  gem: { coins: 10, score: 100 },
  apple: { coins: 0, score: 0 },
};

// an apple is a bite, a ration (data/difficulty.js) a meal
export const APPLE_HEAL = 5;

// a raider scatters a few coins and sometimes a gem or an apple; a boss leaves a chest
export const RAIDER_DROP = { coins: [2, 4], gemChance: 0.1, appleChance: 0.06 };
export const CHEST_DROP = {
  midBoss: { coins: 10, gems: 1, apples: 1 },
  missionBoss: { coins: 16, gems: 4, apples: 1 },
};

// a stage clear knocks out every raider left, so a crowded screen could spill hundreds of pieces;
// past this many the value goes straight into the purse instead
export const MAX_LOOT = 80;

export const LOOT_MOTION = {
  gravity: 0.22,
  bounce: 0.42,
  // a bounce slower than this settles instead
  settleSpeed: 0.9,
  friction: 0.86,
  airDrag: 0.99,
  // how far the hero pulls pieces in, side to side and up and down
  magnetReach: 30,
  magnetHeight: 34,
  magnetPull: 0.55,
  magnetTopSpeed: 6.5,
  collectRadius: 7,
  // ticks a piece must have been out before it can be pulled, so a burst is seen to spill
  pullDelay: 18,
  // a stage clear pulls everything in from anywhere, once it has been seen to spill
  clearPullDelay: 26,
};

// a piece no one takes blinks out after ten seconds
export const LOOT_LIFETIME = 600;
export const LOOT_BLINK = 120;

// coins taken in a quick run climb a major scale (semitones over the first coin's pitch), as in the
// arcade; past its top they keep ringing there
export const COIN_STREAK = { window: 22, scale: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16] };

// ticks after the chest lands: it rattles, bursts open, spills, then sinks away; all of it well
// inside a stage clear (stage-clear.js CLEAR_TICKS), so the pieces still fly to the hero in time
export const CHEST_TIMING = {
  rattleAt: 6,
  openAt: 30,
  spillAt: 36,
  fadeAt: 400,
  gone: 440,
  rattleTicks: 4,
};

export const CHEST_POP = { height: 26, speed: -3.4 };
