// the Angkor Warrior: he raises his dav and cuts through the raiders again and again, too fast to
// follow; each pass leaves a cut of gold hanging on its raider and his own shape carved in sandstone
// where he stopped, like the Bayon's reliefs. He stands still, and every cut lands at once as the
// carvings swing with him and crumble; then he leaps and splits the ground under every raider
export const THOUSAND_CUTS = {
  name: 'Thousand Cuts',
  summary:
    'Cuts through the raiders again and again, leaving gold cuts hanging and his shape carved in stone; every cut lands at once, then he splits the ground.',
  damageText: '3 + 7 per cut + 26',
  intro: 46,
  poseTicks: 10,
  passesAt: 50,
  // ticks he winds up on the frame before a pass's strike, and ticks he takes to cross the raider
  windTicks: 2,
  crossTicks: 4,
  // the passes, in his sword row whatever he holds: each one's [strip, strike frame] and the ticks it
  // takes, quicker as they go; the overhead cut that ends them is held longest
  passes: [
    { sprite: ['slash1', 2], ticks: 12 },
    { sprite: ['slash2', 3], ticks: 11 },
    { sprite: ['spin_slash', 3], ticks: 11 },
    { sprite: ['thrust', 3], ticks: 10 },
    { sprite: ['rising_dragon', 2], ticks: 10 },
    { sprite: ['air_slash', 2], ticks: 9 },
    { sprite: ['cleave', 3], ticks: 14 },
  ],
  // px past the raider he stops after cutting through it
  beyond: 36,
  // he stands still with the dav lowered; then every cut lands at once
  releaseAt: 145,
  // ticks after the cuts land that the carvings crumble
  crumbleAfter: 10,
  leapAt: 164,
  leapHeight: 34,
  chopAt: 180,
  // px kept clear at the screen's edges for the debris thrown up along the split
  edge: 24,
  // ticks the fissure takes to run out from his blade to the screen's edges, and to fade
  fissureRun: 10,
  fissureTicks: 64,
  end: 240,
  cut: {
    damage: 3,
    knockback: [0, 0],
    hitstop: 2,
    hitstun: 120,
    ultimate: true,
  },
  sever: {
    damage: 7,
    knockback: [0.8, -3.4],
    launch: true,
    hitstop: 6,
    hitstun: 30,
    ultimate: true,
  },
  split: {
    damage: 26,
    knockback: [3, -7],
    launch: true,
    knockAway: true,
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
  },
};
