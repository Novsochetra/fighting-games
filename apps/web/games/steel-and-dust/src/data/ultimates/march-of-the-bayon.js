// the Angkor Warrior: he raises his dav and the carved army of the Bayon steps out of the stone across
// the field, a rank fighting each way, then he leaps and splits the ground under every raider
export const MARCH_OF_THE_BAYON = {
  name: 'March of the Bayon',
  summary:
    'Raises his dav; two ranks of carved soldiers step out across the field and fight in step, then he splits the ground.',
  damageText: '3 + 3 + 4 per rank + 26',
  intro: 46,
  poseTicks: 10,
  // when each rank starts to step out, which way it fights (1 is the way he faces), and how far its
  // soldiers stand from the last rank's, so the two ranks stand between each other
  ranks: [
    { at: 48, facing: 1, shift: 0 },
    { at: 76, facing: -1, shift: 24 },
  ],
  // px between the soldiers of a rank, kept clear of the screen's edges and of the hero himself
  spacing: 48,
  edge: 24,
  clearOfHero: 16,
  // ticks the rank takes to rise out across the whole screen, from his feet outward
  wave: 12,
  // ticks after the rank starts on which all its soldiers strike at once: two blows that stagger
  // every raider, then one that throws them
  beats: [22, 32, 44],
  // his own moves each soldier fights, one chain after another down the rank, so no two side by side
  // fight alike; every move's strike frame lands on its beat
  chains: [
    ['slash1', 'slash2', 'thrust'],
    ['spin_slash', 'cleave', 'rising_dragon'],
    ['slash2', 'slash1', 'cleave'],
  ],
  leapAt: 124,
  leapHeight: 34,
  chopAt: 140,
  // ticks the fissure takes to run out from his blade to the screen's edges, and to fade
  fissureRun: 10,
  fissureTicks: 64,
  end: 200,
  blow: {
    damage: 3,
    knockback: [0.5, -1.2],
    hitstop: 3,
    hitstun: 24,
    ultimate: true,
  },
  rank: {
    damage: 4,
    knockback: [1.4, -4],
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
