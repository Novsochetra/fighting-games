import { drawnHeightOf } from '../actors/players.js';
import { project } from '../camera.js';
import { AURA_SHAPES } from './auras/index.js';
import { readyMoveOf } from './charge-ready.js';
import { planOf } from './move-plan.js';

// an aura grows in over GROW ticks and fades out over as many; a ready charge keeps it whole
const GROW = 8;

export function keepAura(effects, { player, move, tick, ticks }) {
  const plan = planOf(move);
  const found = effects.auras.find((aura) => aura.player === player);

  if (!plan?.aura || player === null || player === undefined) {
    return;
  }

  if (found?.move === move) {
    found.until = Math.max(found.until, tick + ticks);
  } else if (found) {
    Object.assign(found, { move, plan, born: tick, until: tick + ticks });
  } else {
    effects.auras.push({ player, move, plan, born: tick, until: tick + ticks });
  }
}

// a player who holds a full charge with the spirit for it sees the aura of what it will fire
export function watchCharges(effects, match) {
  for (const player of match.players) {
    const move = player.charging ? readyMoveOf(match, player) : null;

    if (move) {
      keepAura(effects, { player: player.index, move, tick: match.tick, ticks: GROW });
    }
  }

  effects.auras = effects.auras.filter((aura) => aura.until >= match.tick);
}

const strengthOf = (aura, tick) =>
  Math.min(1, (tick - aura.born + 1) / GROW) * Math.min(1, (aura.until - tick + 1) / GROW);

// under the players, so each wraps round its own player from behind
export function drawAuras(context, camera, effects, { match, standHeight }) {
  for (const aura of effects?.auras ?? []) {
    const player = match.players[aura.player];
    const strength = strengthOf(aura, match.tick);

    if (player && strength > 0) {
      AURA_SHAPES[aura.plan.aura]?.(context, {
        foot: project(camera, player.x, player.y),
        height: drawnHeightOf(player, match, standHeight),
        art: aura.plan.art,
        tick: match.tick,
        strength,
        seed: aura.player * 31 + 7,
      });
    }
  }
}
