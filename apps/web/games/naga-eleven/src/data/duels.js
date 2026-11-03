// when two named players meet, and how a meeting is weighed
export const DUELS = {
  // the defender is this close, in world units, and this far toward where the carrier faces
  range: 40,
  inFront: 0.3,
  // the same two players meet again only after this, and no duel follows another this soon
  pairCooldown: 1500,
  quietTicks: 90,
  // and none starts this soon after a kick off
  kickoffQuietTicks: 240,
  // how far the attacker's stats over the defender's tip the odds, and how far they ever go
  edgeWeight: 0.009,
  leastChance: 0.1,
  mostChance: 0.9,
  // a shot from this share of the pitch's length is in range, a special from a little further
  shotRange: 0.36,
  specialRange: 0.5,
  // stat points a shot loses for each pitch length it travels
  distanceCost: 40,
  // a plain shot goes wide this often; a strong shooter and a strong move narrow it
  wideChance: 0.12,
  leastWide: 0.02,
  // a catch this close to the line it lost by only pushes the ball away
  parryMargin: 0.12,
  winSpirit: 8,
  // an unwatched duel waits this long once decided; a watched one ends itself after the
  // longest show, in case nothing finishes it
  unwatchedTicks: 1,
  showTimeout: 1800,
};

// what the outcome does to the players and the ball, in ticks and world units
export const DUEL_AFTERMATH = {
  floored: 50,
  beaten: 24,
  shaken: 30,
  keeperDown: 40,
  passerPause: 12,
  footGap: 11,
  pastGap: 16,
  passArrival: 2.6,
  passMin: 4,
  passMax: 9.5,
  rollDrag: 0.975,
  parrySpeed: 4,
  wideSpeed: 8,
  blockSpeed: 3.5,
};

// the stats each kind of option leans on, as shares
export const DUEL_STATS = {
  dribble: { dribble: 0.7, speed: 0.3 },
  pass: { pass: 0.9, speed: 0.1 },
  shot: { shot: 1 },
  tackle: { tackle: 0.8, speed: 0.2 },
  block: { tackle: 0.6, stamina: 0.4 },
  intercept: { tackle: 0.5, speed: 0.5 },
  catch: { keeping: 1 },
  punch: { keeping: 0.9, stamina: 0.1 },
  save: { keeping: 1 },
};

// what the defender's read of the attack is worth to them: a tackle meets a dribble, a block a
// shot, an interception a pass, and each is caught out by the others
export const DUEL_READS = {
  tackle: { dribble: 6, pass: -10, shot: -8 },
  block: { dribble: -10, pass: -4, shot: 8 },
  intercept: { dribble: -6, pass: 10, shot: -10 },
  catch: { shot: 0 },
  punch: { shot: 6 },
  save: { shot: 4 },
};

// how much the computer likes each kind of option before the moment weighs in
export const DUEL_WEIGHTS = {
  dribble: 3,
  pass: 2,
  shot: 3,
  special: 6,
  tackle: 4,
  block: 2,
  intercept: 3,
  catch: 5,
  punch: 3,
  save: 7,
};

const basic = (id, kind, en, km) => Object.freeze({ id, kind, label: { en, km }, look: 'plain' });

export const BASIC_OPTIONS = Object.freeze({
  dribble: basic('dribble', 'dribble', 'Dribble', 'នាំបាល់'),
  pass: basic('pass', 'pass', 'Pass', 'បញ្ជូនបាល់'),
  shoot: basic('shoot', 'shot', 'Shoot', 'ទាត់បញ្ចូលទី'),
  tackle: basic('tackle', 'tackle', 'Tackle', 'ដណ្តើមបាល់'),
  block: basic('block', 'block', 'Block', 'រាំងបាល់'),
  intercept: basic('intercept', 'intercept', 'Intercept', 'កាត់បាល់'),
  catch: basic('catch', 'catch', 'Catch', 'ចាប់បាល់'),
  punch: basic('punch', 'punch', 'Punch', 'ដាល់បាល់'),
});

// what each kind of attack comes to when it wins and when it loses
export const FIELD_RESULTS = {
  dribble: ['broke', 'stolen'],
  pass: ['passed', 'cut'],
  shot: ['through', 'blocked'],
};

// a shootout: five kicks each, then one each until one side scores and the other does not
export const PENALTIES = {
  kicks: 5,
  // a kick goes over or wide this often, more often struck harder, less by a good shooter
  miss: 0.05,
  powerMiss: 0.22,
  skillMiss: 600,
  leastMiss: 0.02,
  mostMiss: 0.4,
  // a keeper who goes the right way saves this often, less against a hard kick
  guessSave: 0.5,
  powerBeat: 0.35,
  leastSave: 0.15,
  mostSave: 0.85,
  // a keeper who stays in the middle still reaches a kick to the side now and then
  reach: 0.08,
  mostReach: 0.2,
  // how the computer likes to aim and to dive: left, middle, right
  aimWeights: [0.4, 0.2, 0.4],
  diveWeights: [0.42, 0.16, 0.42],
  leastPower: 0.5,
  powerSpread: 0.4,
};

export const PENALTY_AIMS = Object.freeze([
  Object.freeze({
    id: 'left',
    aim: -1,
    shoot: { en: 'Left', km: 'ឆ្វេង' },
    keep: { en: 'Dive left', km: 'លោតឆ្វេង' },
  }),
  Object.freeze({
    id: 'middle',
    aim: 0,
    shoot: { en: 'Middle', km: 'កណ្តាល' },
    keep: { en: 'Stay', km: 'នៅកណ្តាល' },
  }),
  Object.freeze({
    id: 'right',
    aim: 1,
    shoot: { en: 'Right', km: 'ស្តាំ' },
    keep: { en: 'Dive right', km: 'លោតស្តាំ' },
  }),
]);
