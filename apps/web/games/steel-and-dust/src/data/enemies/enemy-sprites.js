const REGULAR = { frameWidth: 128, frameHeight: 80, feetX: 64, feetY: 76 };
const BOSS = { frameWidth: 192, frameHeight: 112, feetX: 96, feetY: 108 };
// a boss whose own moves reach high (a boulder held overhead) keeps its old frames 48px lower
const TALL_BOSS = { frameWidth: 192, frameHeight: 160, feetX: 96, feetY: 156 };

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
  queen: sheet('queen.png', 'idle 4, walk 8, attack 9/3, hurt 4, ko 9, slam 9/4, charge 8', BOSS),
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
  ironhorn: sheet('ironhorn.png', bossStrips(6, 5), BOSS),
  cobra: sheet('cobra.png', bossStrips(5, 5), BOSS),
  gnoll: sheet('gnoll.png', bossStrips(6, 4), BOSS),
  djinn: sheet('djinn.png', bossStrips(4, 5), BOSS),
  furnace: sheet('furnace.png', bossStrips(5, 5), BOSS),
  pharaoh: sheet('pharaoh.png', bossStrips(5, 5), BOSS),
  naga: sheet('naga.png', bossStrips(5, 5), BOSS),
  guardian: sheet('guardian.png', bossStrips(3, 4), BOSS),
};
