import { drawAimEdge, drawAimMarker, drawAimRing } from './aim-target.js';
import { drawBallAbove } from './ball-above.js';
import { drawBall, drawBallShadow, drawHeldBall } from './ball.js';
import { drawDropMarker } from './drop-marker.js';
import { looksOf } from './looks.js';
import { drawFeetRing, drawMarker } from './marker.js';
import { drawNameTags } from './name-tag.js';
import { drawSteeredEdge } from './steered-edge.js';
import { drawnHeightOf, drawPlayerShadow, playerDrawables } from './players.js';
import { prepareSheets } from './sheets.js';
import { prepareNumbers } from './shirt-number.js';
import { intoPitch, throwerOf } from './throw-in.js';

export { loadSprites } from './load-sprites.js';
export { createActorArt } from './sheets.js';
export { looksOf } from './looks.js';
export { matchKits } from './kit-clash.js';

// paints the sheets and the shirt numbers a match's two kits and its players' looks need, before
// kick off
export function prepareMatchArt(art, match) {
  const { players: looks } = looksOf(match);

  prepareSheets(art, looks);
  prepareNumbers(art, { players: match.players, looks });
}

// every shadow lies on the grass under every player, so they go down first, with the ring of
// the one the human steers, of the mate he aims a pass at and of where a high ball will land
export function drawShadows(context, match, camera) {
  for (const player of match.players) {
    drawPlayerShadow(context, camera, player);
  }

  drawDropMarker(context, camera, match);
  drawBallShadow(context, camera, match.ball);

  if (match.players[match.controlled ?? -1]) {
    drawFeetRing(context, camera, match.players[match.controlled]);
  }

  drawAimRing(context, camera, { match, tick: match.tick });
}

// a ball held for a throw-in is drawn in the thrower's hands, just after him
function ballDrawable(match, camera, art) {
  const thrower = throwerOf(match);
  const heights = art.manifest.animations.throw?.ballHeight;

  if (thrower && heights) {
    const height = heights[intoPitch(match, thrower).y > 0 ? 'south' : 'north'];

    return {
      depth: thrower.y + 0.5,
      draw: (context) => drawHeldBall(context, camera, { thrower, height }),
    };
  }

  return { depth: match.ball.y, draw: (context) => drawBall(context, camera, match.ball) };
}

export function actorDrawables(match, camera, { art, scoringTeam }) {
  return [
    ...playerDrawables(match, camera, { art, scoringTeam }),
    ballDrawable(match, camera, art),
  ];
}

// the steered player's marker and the aimed-at mate's float over their heads, over everything
export function drawActorOverlays(context, match, camera, { art, tick }) {
  const { standHeight } = art;
  const steered = match.players[match.controlled ?? -1];

  if (steered) {
    drawMarker(context, camera, {
      player: steered,
      tick,
      standHeight: drawnHeightOf(steered, match, standHeight),
    });
  }

  drawAimMarker(context, camera, { match, tick, standHeight });
}

// what names and points at the play is drawn in the UI's space, at the HUD's scale, after the
// world: the stars' names, a long ball over the top edge and the arrow on the view's edge to the
// steered player while he is out of it
export function drawPointers(context, match, camera, { art, tick, lang }) {
  const { standHeight } = art;
  const steered = match.players[match.controlled ?? -1];

  drawNameTags(context, camera, match, { lang, looks: looksOf(match), standHeight });
  drawBallAbove(context, camera, match);

  if (steered) {
    drawSteeredEdge(context, camera, { match, player: steered, tick, standHeight });
  }

  drawAimEdge(context, camera, { match, tick, standHeight });
}
