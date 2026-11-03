import { project } from '../camera.js';
import { animationOf } from './animation.js';
import { drawActor } from './draw-actor.js';
import { looksOf } from './looks.js';
import { startsOf } from './memory.js';
import { drawShadow } from './shadow.js';

const SHADOW = { radiusX: 8.5, radiusY: 3, lying: 14, alpha: 0.32 };

export const isLying = (player) => player.stun > 0 || player.tackle > 0 || Boolean(player.dive);

// how tall a player on the ground (a keeper after a dive, a tackled man) is drawn, in the world's
// pixels, for what floats over him: it comes down to him once he is down, a dive's first frames
// still upright
const LYING_HEIGHT = 34;
const DIVE_DOWN_TICKS = 8;

export function drawnHeightOf(player, match, standHeight) {
  const isDown =
    isLying(player) && (!player.dive || match.tick - player.dive.tick >= DIVE_DOWN_TICKS);

  return isDown ? LYING_HEIGHT : standHeight;
}

export function drawPlayerShadow(context, camera, player) {
  const foot = project(camera, player.x, player.y);
  const wide = isLying(player) ? SHADOW.lying : SHADOW.radiusX;

  drawShadow(context, {
    x: foot.x,
    y: foot.y,
    radiusX: wide * foot.scale,
    radiusY: SHADOW.radiusY * foot.scale,
    alpha: SHADOW.alpha,
  });
}

function drawPlayer(context, { art, camera, match, player, look, scoringTeam }) {
  const foot = project(camera, player.x, player.y);
  const starts = startsOf(art.memory, match, player);
  const state = animationOf(player, match, { scoringTeam, starts, kick: art.kick });

  drawActor(context, art, { look, state, x: foot.x, y: foot.y, number: player.number });
}

export function playerDrawables(match, camera, { art, scoringTeam }) {
  const { players: looks } = looksOf(match);

  return match.players.map((player) => ({
    depth: player.y,
    draw: (context) =>
      drawPlayer(context, { art, camera, match, player, look: looks[player.index], scoringTeam }),
  }));
}
