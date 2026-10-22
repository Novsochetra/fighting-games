const REGULAR = { frameWidth: 128, frameHeight: 80, feetX: 64, feetY: 76 };
const BOSS = { frameWidth: 192, frameHeight: 112, feetX: 96, feetY: 108 };
// a boss whose own moves reach high (a boulder held overhead) keeps its old frames 48px lower
const TALL_BOSS = { frameWidth: 192, frameHeight: 160, feetX: 96, feetY: 156 };
// a boss whose own moves reach far ahead (a tail laid along the floor) keeps its old frames 32px in
const WIDE_BOSS = { frameWidth: 256, frameHeight: 112, feetX: 128, feetY: 108 };
// a boss whose moves reach both (a sting stabbing ahead, a tail stabbing straight up) gets both
const BIG_BOSS = { frameWidth: 256, frameHeight: 160, feetX: 128, feetY: 156 };
// the Naga Raja, drawn half as big again as the other bosses, at the same pixel density
const HUGE_BOSS = { frameWidth: 384, frameHeight: 240, feetX: 192, feetY: 236 };

// one PNG per enemy in assets/sprites/enemies/ with a row per strip, in the order listed;
// "attack 9/4" is a strip of 9 frames whose frame 4 holds while the hitbox is out
function sheet(file, spec, size = REGULAR) {
  const strips = {};
  spec.split(', ').forEach((entry, row) => {
    const [name, counts] = entry.split(' ');
    const [frames, strike] = counts.split('/').map(Number);
    strips[name] = strike === undefined ? { row, frames } : { row, frames, strike };
  });
  return { file, ...size, strips };
}

// the boss sheets drawn for the missions share one layout and differ in their strike frames
function bossStrips(attackStrike, slamStrike) {
  return `idle 4, walk 8, attack 9/${attackStrike}, hurt 4, ko 9, slam 9/${slamStrike}, charge 8`;
}

export const ENEMY_SPRITES = {
  raider: sheet('raider.png', 'idle 4, walk 8, attack 9/4, hurt 4, ko 9'),
  scavenger: sheet('scavenger.png', 'idle 4, walk 8, attack 9/4, hurt 4, ko 9'),
  cutter: sheet('cutter.png', 'idle 4, walk 8, attack 9/4, hurt 4, ko 9, lunge 9/3'),
  jackal: sheet('jackal.png', 'idle 4, walk 8, attack 9/2, hurt 4, ko 9'),
  slinger: sheet('slinger.png', 'idle 4, walk 8, attack 9/4, hurt 4, ko 9'),
  bomber: sheet('bomber.png', 'idle 4, walk 8, attack 9/4, hurt 4, ko 9'),
  sentry: sheet('sentry.png', 'idle 4, walk 8, attack 9/2, hurt 4, ko 9'),
  bulwark: sheet('bulwark.png', 'idle 4, walk 8, attack 9/5, hurt 4, ko 9'),
  juggernaut: sheet('juggernaut.png', 'idle 4, walk 8, attack 9/6, hurt 4, ko 9'),
  witch: sheet('witch.png', 'idle 4, walk 8, attack 9/7, hurt 4, ko 9'),
  scorpion: sheet('scorpion.png', 'idle 4, walk 8, attack 9/5, hurt 4, ko 9'),
  assassin: sheet('assassin.png', 'idle 4, walk 8, attack 9/5, hurt 4, ko 9'),
  vulture: sheet('vulture.png', 'idle 4, walk 8, attack 9/4, hurt 4, ko 9'),
  ox: sheet('ox.png', 'idle 4, walk 8, attack 9/5, hurt 4, ko 9, slam 9/5, charge 8', BOSS),
  queen: sheet(
    'queen.png',
    `${bossStrips(3, 4)}, burrow 12, emerge 8/4, tailSting 9/4, hiveSwarm 12/8`,
    BIG_BOSS,
  ),
  colossus: sheet(
    'colossus.png',
    'idle 4, walk 8, attack 9/3, hurt 4, ko 9, slam 9/4, charge 8, boulderLob 10/6, spikeLine 8/4, landslide 12/9',
    TALL_BOSS,
  ),
  ghoul: sheet('ghoul.png', 'idle 4, walk 8, attack 9/5, hurt 4, ko 9'),
  hound: sheet('hound.png', 'idle 4, walk 8, attack 9/6, hurt 4, ko 9'),
  monk: sheet('monk.png', 'idle 4, walk 8, attack 9/4, hurt 4, ko 9'),
  spitter: sheet('spitter.png', 'idle 4, walk 8, attack 9/5, hurt 4, ko 9'),
  stoker: sheet('stoker.png', 'idle 4, walk 8, attack 9/2, hurt 4, ko 9'),
  tombguard: sheet('tombguard.png', 'idle 4, walk 8, attack 9/2, hurt 4, ko 9'),
  khan: sheet(
    'khan.png',
    `${bossStrips(5, 4)}, warHorn 8/5, crescentDash 10/4, tempest 12/5`,
    BOSS,
  ),
  ironhorn: sheet(
    'ironhorn.png',
    `${bossStrips(6, 5)}, hornRush 10/4, uppercut 8/4, dazed 6, stampede 12/6`,
    TALL_BOSS,
  ),
  cobra: sheet(
    'cobra.png',
    `${bossStrips(5, 5)}, venomSpit 8/3, coilLash 10/6, hypnoticGaze 12/9`,
    WIDE_BOSS,
  ),
  gnoll: sheet(
    'gnoll.png',
    `${bossStrips(6, 4)}, packCall 8, leapingMaul 10/7, bloodFrenzy 12/5`,
    TALL_BOSS,
  ),
  djinn: sheet(
    'djinn.png',
    `${bossStrips(4, 5)}, thunderFist 8/3, dustDevil 8/4, eyeOfStorm 12/6`,
    TALL_BOSS,
  ),
  furnace: sheet(
    'furnace.png',
    `${bossStrips(5, 5)}, fireFlail 10/6, slagPot 8/4, meltdown 10/4`,
    BIG_BOSS,
  ),
  pharaoh: sheet(
    'pharaoh.png',
    `${bossStrips(5, 5)}, mirage 9, scarabCarpet 8/3, curseOfSun 12/9`,
    BIG_BOSS,
  ),
  naga: sheet(
    'naga.png',
    'idle 4, walk 8, attack 9/4, hurt 4, ko 9, slam 9/5, charge 8, tidalCoil 9/5, sevenHeads 8/4, rainbowNaga 12/3',
    HUGE_BOSS,
  ),
  guardian: sheet('guardian.png', bossStrips(3, 4), BOSS),
};
