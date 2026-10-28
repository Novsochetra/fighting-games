import { HAMMER, HAMMER_SLAM } from '../../data/hammers.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';
import { HAMMER_BEAT, hammerPhase } from './hammer-beat.js';
import { hazardAttacker } from './hazard-attacker.js';

// each hammer keeps its own beat, so two on one floor never slam together
export function createHammers(hammers) {
  return hammers.map(({ x, y }) => ({ x, y, time: x % HAMMER_BEAT }));
}

// everything under the raised head when it comes down
export function slamArea(hammer) {
  return {
    x: hammer.x - HAMMER.halfWidth,
    y: hammer.y - HAMMER.lift,
    width: HAMMER.halfWidth * 2,
    height: HAMMER.lift,
  };
}

// a raider caught is the hero's hit, so it scores and builds the combo; the hero caught is hurt
// as by a raider's
function crush(game, hammer, target) {
  const hero = target.side === 'player';
  const attacker = hazardAttacker(
    { x: hammer.x, direction: 1, side: hero ? 'enemy' : 'player' },
    hero ? 'none' : 'axe',
  );
  const move = hero ? HAMMER_SLAM.hero : HAMMER_SLAM.raider;

  applyHit(game, { attacker, target, move, x: target.x, y: target.y - 12 });
}

function slam(game, hammer) {
  const area = slamArea(hammer);

  for (const target of game.fighters.slice()) {
    const body = hurtBox(target);

    if (body && !target.entering && overlaps(area, body)) {
      crush(game, hammer, target);
    }
  }

  addBurst(game, { sprite: 'steam', x: hammer.x, y: hammer.y, scale: 0.8, behind: true });
  addDust(game, { x: hammer.x, y: hammer.y, count: 8 });
  shake(game, 3, 10);
  game.io.sfx('hammerSlam', false, { x: hammer.x });
}

export function updateHammers(game) {
  for (const hammer of game.hammers) {
    hammer.time = (hammer.time + 1) % HAMMER_BEAT;
    const { phase, at } = hammerPhase(hammer.time);

    if (phase === 'warn' && at === 0) {
      game.io.sfx('steam', false, { x: hammer.x });
    } else if (phase === 'down' && at === 0) {
      slam(game, hammer);
    }
  }
}
