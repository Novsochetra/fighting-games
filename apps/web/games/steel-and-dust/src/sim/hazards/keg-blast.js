import { COLORS } from '../../art/colors.js';
import { KEG, KEG_BLAST } from '../../data/kegs.js';
import { randomBetween } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addBurst } from '../summons/bursts.js';
import { hazardAttacker } from './hazard-attacker.js';

// the blast art is drawn at twice the sprites' density, as big as the reach it hits
const BLAST_SCALE = 2;

export function blastArea(keg) {
  return {
    x: keg.x - KEG.reach,
    y: keg.y - KEG.rise,
    width: KEG.reach * 2,
    height: KEG.rise + 8,
  };
}

// a raider caught is the hero's hit, so it scores and builds the combo; the hero caught is hurt
// as by a raider's
function strike(game, keg, target) {
  const hero = target.side === 'player';
  const direction = target.x >= keg.x ? 1 : -1;
  const attacker = hazardAttacker(
    { x: keg.x, direction, side: hero ? 'enemy' : 'player' },
    hero ? 'none' : 'axe',
  );
  const move = hero ? KEG_BLAST.hero : KEG_BLAST.raider;
  applyHit(game, { attacker, target, move, x: target.x, y: target.y - 16 });
}

function scatterStaves(game, keg) {
  for (let i = 0; i < 16; i++) {
    game.particles.push({
      kind: 'chunk',
      x: keg.x + randomBetween(-7, 7),
      y: keg.y - 14 + randomBetween(-8, 8),
      vx: randomBetween(-3.4, 3.4),
      vy: randomBetween(-5, -1.4),
      life: 70,
      maxLife: 70,
      color: i % 3 ? COLORS.crateWood : COLORS.crateDark,
    });
  }
}

export function blowKeg(game, keg) {
  Object.assign(keg, { lit: false, gone: true });
  const area = blastArea(keg);
  for (const target of game.fighters.slice()) {
    const body = hurtBox(target);
    if (body && overlaps(area, body)) {
      strike(game, keg, target);
    }
  }
  addBurst(game, { sprite: 'blast', x: keg.x, y: keg.y, scale: BLAST_SCALE });
  scatterStaves(game, keg);
  shake(game, 4, 16);
  game.flashTime = Math.max(game.flashTime, 4);
  game.io.sfx('boom', false, { x: keg.x });
}
