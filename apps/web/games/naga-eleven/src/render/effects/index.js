import { drawBall } from '../actors/ball.js';
import { drawAuras, watchCharges } from './auras.js';
import { followCarries } from './carries.js';
import { createCombos, holdThroughDuel, syncCombos } from './combo-watch.js';
import { drawDust } from './dust.js';
import { expireEffects } from './effect-list.js';
import { drawFlash } from './flash.js';
import { followFlight } from './flight.js';
import { effectsFromEvents } from './from-events.js';
import { playPending } from './from-moves.js';
import { effectsFromPlayers } from './from-players.js';
import { ghostDrawer } from './ghost-drawer.js';
import { drawGrassBits } from './grass-bits.js';
import { drawImpact } from './impact-list.js';
import { createRing, pushPoint } from './ring.js';
import { drawBallTrail, drawCarries } from './draw-trail.js';

export { drawFlash };

const TRAIL_LENGTH = 16;

// The effects are the frame's own: made once a match, fed once a tick with what happened
// (updateEffects, before the app drains match.events) and drawn every frame from match.tick
export function createEffects() {
  return {
    list: [],
    trail: createRing(TRAIL_LENGTH),
    flight: null,
    carries: [],
    auras: [],
    pending: [],
    guard: null,
    passes: [[], []],
    combos: createCombos(),
    pops: [],
    popups: [],
    goal: null,
    flash: null,
    watch: null,
    match: null,
  };
}

function startMatch(effects, match) {
  Object.assign(effects, createEffects(), { match });
}

export function updateEffects(effects, match, { camera } = {}) {
  if (effects.match !== match) {
    startMatch(effects, match);
  }

  // a trail that is over keeps where its ball went, and draws in toward it
  if (effects.flight?.endedAt === null || !effects.flight) {
    pushPoint(effects.trail, match.ball);
  }

  playPending(effects, match);
  effectsFromEvents(effects, match, camera);
  effectsFromPlayers(effects, match);
  syncCombos(effects, match);
  holdThroughDuel(effects, match);
  watchCharges(effects, match);
  expireEffects(effects, match.tick);
  followFlight(effects, match, match.events ?? []);
  followCarries(effects, match);
}

const DRAWERS = { dust: drawDust, grass: drawGrassBits, impact: drawImpact };

export function drawEffects(context, effects, { camera, match }) {
  for (const effect of effects?.list ?? []) {
    DRAWERS[effect.kind]?.(context, camera, effect, match.tick);
  }
}

// auras and what players carry, wrapped round them from behind
export function drawUnderPlayers(context, effects, { camera, match, art, scoringTeam }) {
  if (!effects) {
    return;
  }

  drawAuras(context, camera, effects, { match, standHeight: art.standHeight });
  drawCarries(context, camera, effects, {
    match,
    drawGhost: ghostDrawer(art, match, { scoringTeam }),
    bake: art.createCanvas,
  });
}

// a move's ball trail over the players, the ball drawn again over its own trail
export function drawOverPlayers(context, effects, { camera, match, art }) {
  const isFree = match.ball.owner === null || match.ball.owner === undefined;
  const bake = art?.createCanvas ?? null;

  if (drawBallTrail(context, camera, effects, { match, bake }) && isFree) {
    drawBall(context, camera, match.ball);
  }
}

// the side that scored last: read from its goal event, or from the match while none was seen
export function scoringTeamOf(match, effects) {
  return effects?.goal?.team ?? match.lastScorer ?? null;
}
