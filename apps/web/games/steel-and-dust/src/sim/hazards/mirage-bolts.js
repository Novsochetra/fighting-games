import { FX_COLORS } from '../../art/fx-colors.js';
import { addSparks } from '../fx/particles.js';

const BOLT_SPEED = 2.8;
const BOLT_DAMAGE = 8;
// the orb on the staff thrust low (scarabCarpet frame 3), in sheet pixels from his feet halved and
// scaled like his body
export const THRUST_ORB = { ahead: 27.3, up: 10.4 };

// a copy of the Pharaoh looses a bolt of mirage light from its orb, level at the hero
export function fireMirageBolt(game, { boss, from }) {
  const x = from.x + from.facing * THRUST_ORB.ahead * boss.scale;
  const y = from.y - THRUST_ORB.up * boss.scale;
  game.projectiles.push({
    kind: 'mirageBolt',
    x,
    y,
    direction: from.facing,
    speed: BOLT_SPEED,
    side: boss.side,
    time: 0,
    damage: BOLT_DAMAGE,
    hitTargets: new Set(),
  });
  addSparks(game, { x, y, count: 6, color: FX_COLORS.orbBlue, speed: 1.6 });
  game.io.sfx('mirageBolt', false, { x, dir: from.facing });
}
