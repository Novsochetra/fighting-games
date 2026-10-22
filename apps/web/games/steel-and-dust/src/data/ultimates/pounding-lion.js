// Bokator: a bow and a slam that throws the raiders up, then he lets the sword go to gold and rushes
// them bare-handed, a blur of elbows, knees and kicks; every blow leaves a gold echo of him that
// strikes again, and each echo rises as one of the guardian lions that line Angkor's stairs, the
// pride pouncing as one where his sword, back in his hand, pounds the ground; bokator means
// "pounding the lion"
export const POUNDING_LION = {
  name: 'Pounding the Lion',
  summary:
    'Slams the raiders up and rushes them bare-handed; every blow leaves a gold echo that strikes again, then rises as a lion.',
  damageText: '8 + 6 per blow + 3 per lion + 24',
  intro: 46,
  // ticks for each frame of the bow, before the blow
  poseTicks: 16,
  slamAt: 60,
  // the sword goes to gold and he coils, the lion's breath gathering round him
  gatherAt: 72,
  rushAt: 86,
  // ticks a zip to the next raider takes, leaving gold images of him along the way
  zipTicks: 4,
  // ticks he winds up on the frame before a blow's strike frame
  windTicks: 2,
  // the rush, in the fists row of his strips: each blow's [strip, strike frame] and the ticks it takes
  // from the zip to the next one, quicker as it goes; the elbow drops him on the last raider
  rush: [
    { sprite: ['slash2', 2], ticks: 12 },
    { sprite: ['spin_slash', 3], ticks: 11 },
    { sprite: ['rising_dragon', 2], ticks: 10 },
    { sprite: ['thrust', 3], ticks: 10 },
    { sprite: ['slash2', 3], ticks: 9 },
    { sprite: ['air_slash', 2], ticks: 9 },
    { sprite: ['air_rising_cut', 2], ticks: 9 },
    { sprite: ['cleave', 3], ticks: 16 },
  ],
  // ticks an echo holds his blow before it strikes again
  echoDelay: 12,
  // the echoes wake one after another, this many ticks apart, and rise as lions
  ripple: 2,
  // the lions in the order the echoes wake: each one's size, and the ticks it crouches after rising,
  // so no two ever bound in step; the last is the big leader
  pride: [
    { scale: 0.4, wait: 0 },
    { scale: 0.46, wait: 4 },
    { scale: 0.36, wait: 1 },
    { scale: 0.5, wait: 6 },
    { scale: 0.42, wait: 2 },
    { scale: 0.54, wait: 5 },
    { scale: 0.46, wait: 4 },
    { scale: 0.72, wait: 6 },
  ],
  // ticks of a lion's hop toward the heap before its leap onto it
  hopTicks: 14,
  // they pounce on the heap one after another, this many ticks apart, the leader last as he strikes
  cascade: 3,
  pounceAt: 250,
  // heights for a lion of scale 0.5; bigger ones leap higher
  hopHeight: 24,
  pounceHeight: 80,
  end: 284,
  slam: {
    damage: 8,
    knockback: [0.4, -4.6],
    launch: true,
    hitstop: 8,
    hitstun: 30,
    ultimate: true,
  },
  blow: {
    damage: 4,
    knockback: [0.6, -3.4],
    launch: true,
    hitstop: 3,
    hitstun: 30,
    ultimate: true,
  },
  // the elbow drives the last raider into the ground, and it bounces up for the pride
  drop: {
    damage: 6,
    knockback: [0.6, 0],
    spike: true,
    hitstop: 7,
    hitstun: 30,
    ultimate: true,
  },
  echo: {
    damage: 2,
    knockback: [0.4, -2.8],
    launch: true,
    hitstop: 3,
    hitstun: 30,
    ultimate: true,
  },
  lion: {
    damage: 3,
    knockback: [1.8, -3.6],
    launch: true,
    hitstop: 4,
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
