import { COLORS } from '../../../art/colors.js';
import { addRing } from '../effects.js';
import { fxBetween, fxRandom } from '../fx-random.js';

// where a heavy's power gathers and where its blade is now, in world pixels
export function chestOf(fighter) {
  return { x: fighter.x + fighter.facing * 3, y: fighter.y - 20 };
}

export function bladeTipOf(fighter) {
  const last = fighter.trail[fighter.trail.length - 1];
  return last ? { x: last.tipX, y: last.tipY } : chestOf(fighter);
}

// motes drawn in from a ring round the point, each arriving as it fades
export function gatherMotes(game, at, { colors, radius = 26, life = 10, count = 2 }) {
  for (let i = 0; i < count; i++) {
    const angle = fxRandom(game) * Math.PI * 2;
    const distance = fxBetween(game, radius * 0.7, radius);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    game.particles.push({
      kind: 'mote',
      x: at.x + dx,
      y: at.y + dy,
      vx: -dx / life,
      vy: -dy / life,
      life,
      maxLife: life,
      color: colors[i % colors.length],
    });
  }
}

// motes left where the blade passed, drifting off behind the swing
export function shedMotes(game, at, { colors, direction, count = 2, life = 16 }) {
  for (let i = 0; i < count; i++) {
    game.particles.push({
      kind: 'mote',
      x: at.x + fxBetween(game, -3, 3),
      y: at.y + fxBetween(game, -3, 3),
      vx: direction * fxBetween(game, 0.3, 0.9),
      vy: -fxBetween(game, 0.1, 0.5),
      life,
      maxLife: life,
      color: colors[i % colors.length],
    });
  }
}

// sparks thrown every way from a point, as addSparks does, from the dressing's own random stream
export function fxSparks(game, { x, y, count, color, speed }) {
  for (let i = 0; i < count; i++) {
    const angle = fxRandom(game) * Math.PI * 2;
    const velocity = fxBetween(game, speed * 0.4, speed);
    game.particles.push({
      kind: 'spark',
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: Math.round(fxBetween(game, 8, 14)),
      maxLife: 14,
      color: i % 3 ? color : COLORS.white,
    });
  }
}

// a kit every Shade can start from: motes gather while it winds up, a ring bursts as it strikes,
// motes trail the blade and sparks fly where a blow lands
export function defaultKit(art, sounds) {
  return {
    sounds,
    windup() {},
    gather(game, fighter, _move, time) {
      if (time % 2 === 0) {
        gatherMotes(game, chestOf(fighter), { colors: art.motes });
      }
    },
    release(game, fighter) {
      const at = chestOf(fighter);
      addRing(game, { ...at, color: art.glow });
      fxSparks(game, { ...at, count: 8, color: art.hot, speed: 3 });
    },
    trail(game, fighter, _move, time) {
      if (time % 2 === 0) {
        shedMotes(game, bladeTipOf(fighter), { colors: art.motes, direction: -fighter.facing });
      }
    },
    impact(game, hit) {
      fxSparks(game, { x: hit.x, y: hit.y, count: 6, color: art.hot, speed: 3.4 });
    },
    particles: {},
  };
}
