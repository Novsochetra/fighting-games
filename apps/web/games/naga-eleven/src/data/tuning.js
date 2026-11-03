// A pair [a, b] is the value at a stat of 1 and at 99 (src/sim/stats.js reads between them)
// the match runs about an eighth slower than it first did (players, passes and the ball's fall;
// shots keep their pace), as players found it too quick to follow
export const PLAYER = {
  radius: 10,
  run: [1.72, 2.42],
  sprintGain: 1.34,
  // the share of their pace a dribbler keeps with the ball at their feet
  dribblePace: [0.86, 0.96],
  // the share of the gap to the wanted velocity closed each tick
  turn: 0.22,
  reach: 17,
  // how much nearer than the mate a pass was played to an opponent must be to take it off him
  receiverEdge: 12,
  // and the man the player steers, of a loose ball near him he and an opponent go for together
  steeredEdge: 6,
  reachHeight: 16,
  chestHeight: 34,
  headHeight: 54,
  worldMargin: 40,
  // slower than this a player stands still, as far as the defenders closing him down can tell
  stillSpeed: 0.5,
};

// how long a full sprint stays fast, and how fast it comes back
export const STAMINA = { sprintTicks: [160, 520], refillTicks: 540, tiredBelow: 0.3 };

// a refill this slow gives a star two or three specials a match, not one each attack; a trigger's
// full gauge late in a final is then worth waiting for
export const SPIRIT = {
  max: [50, 100],
  start: 0.25,
  refill: 0.003,
  // good play fills the gauge of the one who plays it (README "Spirit"), and each star on his side
  // takes `starShare` of every mate's gain, so a side that plays well wakes its stars; a goal
  // against fills every star of the side that let it in
  gain: { pass: 2, oneTwo: 3, beat: 6, tackle: 6, intercept: 4, block: 5, save: 6, parry: 4 },
  starShare: 0.1,
  conceded: 10,
};

export const KEEPER = {
  reach: [16, 24],
  diveReach: [24, 34],
  reaction: [22, 8],
  // ticks either side of the reaction a keeper reads one shot sooner and another later
  readSpread: 6,
  goalWidth: 125,
  reachHeight: 74,
  line: 16,
  // a ball slower than this is always held
  easySpeed: 5.5,
  // the share of touches, and of holds, lost at the very end of the reach
  missAtStretch: 0.8,
  stretchCost: 0.5,
  skill: [-0.25, 0.25],
  hold: 50,
  // the player's keeper, left standing with the ball this long, plays it out himself
  humanHold: 180,
  diveSpeed: 3.2,
  diveTicks: 36,
  diveFrom: 12,
  claimSpeed: 5,
};

export const BALL = {
  radius: 5,
  gravity: 0.19,
  bounce: 0.55,
  // a bounce slower than this dies on the grass
  settle: 0.9,
  rollDrag: 0.982,
  airDrag: 0.995,
  netBounce: 0.2,
  postBounce: 0.55,
  post: 3,
  dribbleGap: 12,
  runoff: 70,
};

export const KICK = {
  // a pass is struck to arrive at this speed
  passArrival: 3.9,
  passMin: 3.5,
  passMax: 12.3,
  groundReach: 520,
  receiveTicks: 80,
  noPickupTicks: 12,
  chargeTicks: 40,
  // a pass held this long goes in the air
  loftFrom: 10,
  // a lofted pass climbing faster than this is still over the head of the man in front
  chipRise: 3,
  loftTicks: [47, 76],
  loftReach: [180, 900],
  throwReach: 260,
  passSpread: [0.07, 0.015],
  // a ball in the air is harder to drop on a spot than one along the grass
  loftSpread: 1.5,
  passWeight: [0.16, 0.03],
  shotMin: 9.5,
  shotMax: [12.5, 17],
  shotSpread: [0.75, 0.2],
  // the share of shots an outfield player misses at the very end of his reach
  blockMiss: 1,
  liftMin: 1.2,
  liftMax: 4.2,
  // a ball this fast is hard to bring down: the chance of a heavy touch grows with each unit over
  touchSpeed: [5, 11],
  heavyTouch: 0.12,
  // the share of a dropping ball's pace that counts against the touch of the mate it was played to
  dropCushion: 0.6,
  // with an opponent this near him it is taken in a hurry, and keeps more of its pace
  pressedGap: 30,
  pressedCushion: 0.85,
};

export const TACKLE = {
  ticks: 14,
  speed: 4.05,
  reach: 19,
  recoverTicks: 42,
  stunTicks: 36,
  knock: 3,
  challengeReach: 17,
  challengeRecover: 34,
  // after any tackle on them a carrier is not gone in on again for this long, by anyone
  respiteTicks: 40,
  // the chance a tackle wins the ball, before tackle against dribble moves it
  odds: 0.45,
  oddsGain: 0.7,
  oddsRange: [0.12, 0.9],
};

export const AI = {
  firstTouchTicks: 8,
  pressure: 34,
  passChance: 0.1,
  // the least safety (src/sim/brains/pass-options.js) a pass is played with
  passSafety: 0.7,
  calmPassChance: 0.035,
  // in goal widths from the goal's middle
  shootRange: [2.3, 3.3],
  shootChance: 0.05,
  closeShot: 0.18,
  crossChance: 0.06,
  tackleRange: 26,
  slideChance: 0.006,
  challengeChance: 0.025,
  tackleFacing: 0.5,
  sprintFrom: 60,
  firstTimeChance: 0.55,
  // a defender goes for a pass to one of theirs when he beats the receiver to it by this many
  // ticks, or stands this near where the receiver will meet it
  contestTicks: 6,
  contestReach: 22,
  runChance: 0.03,
  runTicks: 70,
  secondPresser: 200,
  // how far from the carrier, least and most, the second presser stands in the way of his pass
  laneGap: [30, 90],
  markGap: 22,
  jockeyGap: 18,
  // a carrier who stands on the ball this long is stepped in on, to closeGap, inside
  // TACKLE.challengeReach; a stop to pick a pass is shorter
  standTicks: 90,
  closeGap: 12,
  standKeenness: 2,
  // the player has a ball they have just taken this long before anyone goes in, and is gone in on
  // this share as often as the computer goes in on itself
  graceTicks: 30,
  humanKeenness: 0.7,
  // anyone, the computer's players too, has a ball they have just won this long to themselves
  takeGraceTicks: 20,
  spotEvery: 12,
  specialChance: 0.5,
  restartThink: 40,
  // a player's own restart left this long is taken for them
  restartIdle: 480,
};

// after control jumps to a mate by itself, the stick held for the last one is his only once it
// moves, or after holdTicks
// with a loose ball control goes to the man who gets to it this many ticks sooner, this long after
// the last change
export const SWITCH = {
  autoGap: 130,
  cooldownTicks: 60,
  holdTicks: 10,
  looseLag: 20,
  looseWait: 30,
};

export const PHASE_TICKS = {
  kickoff: 75,
  goal: 150,
  halfTime: 180,
  fullTime: 120,
  outRoll: 24,
  restartReady: 50,
};
