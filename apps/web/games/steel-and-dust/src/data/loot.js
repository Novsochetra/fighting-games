// what fallen raiders and bosses leave on the road, and what it is worth
export const LOOT_VALUES = {
  coin: { coins: 1, score: 10 },
  gem: { coins: 10, score: 100 },
  apple: { coins: 0, score: 0 },
};

// an apple is a bite, a ration (data/difficulty.js) a meal
export const APPLE_HEAL = 5;

// a raider only now and then scatters a few coins, with a gem among them at times, and on its own
// odds an apple; a boss always leaves a chest
export const RAIDER_DROP = { chance: 0.4, coins: [1, 3], gemChance: 0.15, appleChance: 0.06 };
export const CHEST_DROP = {
  midBoss: { coins: 10, gems: 1, apples: 1 },
  missionBoss: { coins: 16, gems: 4, apples: 1 },
};

// a stage clear knocks out every raider left, so a crowded screen could spill hundreds of pieces;
// past this many the value goes straight into the purse instead
export const MAX_LOOT = 80;

export const LOOT_MOTION = {
  gravity: 0.22,
  bounce: 0.5,
  // a bounce slower than this rolls on along the floor instead
  settleSpeed: 0.9,
  friction: 0.86,
  airDrag: 0.99,
  // a rolling piece loses this share of its speed a tick, and rests once slower than rollStop
  rollFriction: 0.92,
  rollStop: 0.06,
  // a rolling piece follows the floor down a dip no deeper than this, and drops off a deeper one
  rollDip: 3,
  // ticks a piece must have been out before the hero can take it, so a burst is seen to spill
  pickupDelay: 18,
  // the box round a piece's foot the hero's body has to touch to take it
  pieceWidth: 8,
  pieceHeight: 8,
};

// a piece no one takes, a raider's or the boss's, blinks out after five seconds
export const LOOT_LIFETIME = 300;
export const LOOT_BLINK = 120;

// once the mission's boss falls the hero fetches its loot before the clear: the loot time ends a
// short beat after the last piece in reach is taken or has blinked out, and never runs past `limit`
export const LOOT_TIME = { limit: 600, settle: 40 };

// coins taken in a quick run climb a major scale (semitones over the first coin's pitch), as in the
// arcade; past its top they keep ringing there
export const COIN_STREAK = { window: 22, scale: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16] };

// ticks after the chest lands: it rattles, bursts open, spills, then sinks away; it spills early in
// the loot time (LOOT_TIME), so the hero has most of it to fetch the pieces
export const CHEST_TIMING = {
  rattleAt: 6,
  openAt: 30,
  spillAt: 36,
  fadeAt: 400,
  gone: 440,
  rattleTicks: 4,
};

export const CHEST_POP = { height: 26, speed: -3.4 };

// a chest bursts open flinging its loot out to both sides, fast and slow, so it lands, bounces and
// rolls all over the arena; horizontal speeds and lifts, in pixels a tick
export const CHEST_SCATTER = { speed: [0.3, 3.8], lift: [-5.4, -3.2] };
