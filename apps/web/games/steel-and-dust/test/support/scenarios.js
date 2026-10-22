export const SCENARIOS = {
  campaign: {
    seed: 1234,
    ticks: 7200,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: {
      600: ['mute'],
      640: ['mute'],
      900: ['pause'],
      1200: ['w2'],
      2000: ['fill'],
      2400: ['w3'],
      3000: ['debug'],
      3300: ['debug'],
      3600: ['w4'],
      4800: ['w1'],
      6000: ['w2'],
    },
  },
  boss: {
    seed: 99,
    ticks: 4000,
    sampleEvery: 30,
    renderEvery: 200,
    spawnBossAt: 30,
    scheduled: { 400: ['w4'], 1400: ['w3'], 2400: ['w2'], 3200: ['fill'] },
  },
  // Gravel Khan on his own road: his duelist footwork, Crescent Dash, War Horn and, once the bot
  // has worn him below 40%, Khan's Tempest
  khan: {
    boss: 'khan',
    seed: 4321,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 120,
    spawnBossAt: 30,
    scheduled: { 600: ['fill'], 1200: ['w2'], 2400: ['w3'], 3600: ['fill'] },
  },
  // the Rust Colossus in the Old Grove: his walk, Spike Line and, below 40%, the Landslide (the bot
  // never keeps far enough away for a Boulder Lob; test/integration/sim/colossus.test.js covers it)
  colossus: {
    mission: 1,
    boss: 'colossus',
    seed: 11,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 120,
    spawnBossAt: 30,
    scheduled: { 600: ['fill'], 1200: ['w3'], 2400: ['w2'], 3600: ['fill'] },
  },
  // Ironhorn at the Bamboo Pass: his rushes, the daze when one meets the wall, the uppercut and,
  // below 40%, the Stampede
  ironhorn: {
    mission: 2,
    boss: 'ironhorn',
    seed: 42,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 120,
    spawnBossAt: 30,
    scheduled: { 600: ['fill'], 1200: ['w3'], 2400: ['w2'], 3600: ['fill'] },
  },
  // the Cobra Matriarch at the Raider Camp: her coil lash, venom spit and, below half health, the
  // five-glob spray, and below 40% the Hypnotic Gaze holding the hero for her lunge
  cobra: {
    mission: 3,
    boss: 'cobra',
    seed: 1035,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 120,
    spawnBossAt: 30,
    scheduled: { 600: ['fill'], 1200: ['w3'], 2400: ['w2'], 3600: ['fill'] },
  },
  // the Scorpion Queen in the Ember Woods: her scuttle, Tail Sting, Burrow Ambush (going under
  // twice below half health) and, below 40%, the Hive Swarm's wasps
  queen: {
    mission: 4,
    boss: 'queen',
    seed: 19,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 120,
    spawnBossAt: 30,
    scheduled: { 600: ['fill'], 1200: ['w3'], 2400: ['w2'], 3600: ['fill'] },
  },
  // the Gnoll Packlord in Firefly Hollow: his darting, Leaping Maul, Pack Call and, below 40%, the
  // Blood Frenzy's five lunges and his panting after (the three-hound call is in gnoll.test.js)
  gnoll: {
    mission: 5,
    boss: 'gnoll',
    seed: 3,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 120,
    spawnBossAt: 30,
    scheduled: { 600: ['fill'], 1200: ['w3'], 2400: ['w2'], 3600: ['fill'] },
  },
  // the other Shades: their own fighting style on every weapon and their own ultimate
  firefly: {
    hero: 'firefly',
    seed: 314,
    ticks: 2400,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 500: ['fill'], 900: ['w2'], 1500: ['w3'], 1700: ['fill'] },
  },
  antler: {
    hero: 'antler',
    seed: 2718,
    ticks: 2400,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 500: ['fill'], 900: ['w4'], 1500: ['w2'], 1700: ['fill'] },
  },
  blue: {
    hero: 'blue',
    seed: 1618,
    ticks: 2400,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 500: ['fill'], 900: ['w2'], 1500: ['w1'], 1700: ['fill'] },
  },
  ember: {
    hero: 'ember',
    seed: 2468,
    ticks: 2400,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 500: ['fill'], 900: ['w3'], 1500: ['w4'], 1700: ['fill'] },
  },
  // the Bokator fighter: lion finishers with his own bare-hand moves, then the sword, then his ultimate
  bokator: {
    hero: 'bokator',
    seed: 1357,
    ticks: 2400,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 500: ['fill'], 900: ['w2'], 1700: ['fill'] },
  },
  // the Angkor Warrior: carved soldiers out of the stone on his finishers with his fists, the sword,
  // the spear and the axe, and his ultimate twice
  angkor: {
    hero: 'angkor',
    seed: 1181,
    ticks: 2400,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 500: ['fill'], 700: ['w2'], 1100: ['w3'], 1500: ['w4'], 1700: ['fill'] },
  },
  // the wide, scrolling zones of the fourth mission: spitters, hounds and shield bearers
  bazaar: {
    mission: 3,
    seed: 4242,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 600: ['fill'], 1200: ['w2'], 2400: ['w3'], 3000: ['fill'], 3600: ['w4'] },
  },
  // the third mission's hills: stairs, banks and plank decks the bot climbs, drops and fights on
  hills: {
    mission: 2,
    seed: 2024,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 600: ['fill'], 1200: ['w2'], 2400: ['w4'], 3000: ['fill'], 3600: ['w3'] },
  },
  // the seventh mission, the painted canyon in a sandstorm: blinking witches and assassins,
  // slings, bombers and sentries on wide zones over dunes, rock ledges and scaffolds
  sandstorm: {
    mission: 6,
    seed: 777,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 600: ['fill'], 1200: ['w3'], 2400: ['w2'], 3000: ['fill'], 3600: ['w4'] },
  },
  // the last mission, the Bayon: root mounds, stone terraces and ledges, and the temple's own air,
  // bats, flames in the fire bowls and the canopy drawn over the fight
  bayon: {
    mission: 11,
    seed: 1212,
    ticks: 4800,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: { 600: ['fill'], 1200: ['w4'], 2400: ['w2'], 3000: ['fill'], 3600: ['w3'] },
  },
};
