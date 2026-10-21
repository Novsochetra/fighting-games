// Bokator: a bow, a slam that throws the raiders up, then the guardian lion of Angkor bounds across
// the field and back and pounces in the middle; bokator means "pounding the lion"
export const POUNDING_LION = {
  name: 'Pounding the Lion',
  summary:
    'A bow, a slam that throws every raider up, then a golden lion bounds across the field and pounces.',
  damageText: '8 + 10 per lion pass + 24',
  intro: 46,
  // ticks for each frame of the bow, before the blow
  poseTicks: 16,
  slamAt: 60,
  lionAt: 64,
  // ticks the lion takes to rise out of gold fire behind the hero and roar
  appear: 22,
  // ticks after it starts its run at which it lands on each point: from behind the hero to the edge
  // ahead in three leaps, then one high bound back down on the middle
  legs: [0, 20, 40, 60, 88],
  leapHeight: 70,
  pounceHeight: 80,
  end: 216,
  slam: {
    damage: 8,
    knockback: [0.4, -4.6],
    launch: true,
    hitstop: 8,
    hitstun: 30,
    ultimate: true,
  },
  lion: {
    damage: 10,
    knockback: [2.6, -4.4],
    launch: true,
    hitstop: 6,
    hitstun: 30,
    ultimate: true,
  },
  pounce: {
    damage: 24,
    knockback: [3.2, -7],
    launch: true,
    knockAway: true,
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
  },
};
