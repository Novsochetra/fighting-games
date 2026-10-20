import { randomBetween } from '../../lib/math.js';
import { themeOf } from '../fighters/hero-colors.js';

const QUIET_STATES = new Set(['ko', 'down', 'ult']);

// each Shade sheds motes of its own glow; the Firefly Shade trails a whole swarm
export function shedHeroAura(game) {
  const player = game.player;
  const { aura } = themeOf(game);
  if (game.mode !== 'play' || QUIET_STATES.has(player.state) || game.tickCount % aura.every) {
    return;
  }
  game.particles.push({
    kind: 'mote',
    x: player.x + randomBetween(-8, 8),
    y: player.y - randomBetween(4, 28),
    vx: randomBetween(-0.25, 0.25),
    vy: -randomBetween(0.15, 0.55),
    life: 28,
    maxLife: 28,
    color: aura.color,
  });
}
