import { MINIMAP } from '../art/venues/minimap.js';
import { colourGap, matchKits } from './actors/kit-clash.js';

// a pixel radar of the whole pitch, seen from above: both sides as dots in their shirts' colour,
// keepers in theirs, the ball in white and the player being steered ringed in gold, blinking
const STRIPES = 8;
const PANEL_ALPHA = 0.82;
const DOT = 3;

function box(context, colour, [x, y, width, height]) {
  context.fillStyle = colour;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawPanel(context, { x, y, width, height }, alpha) {
  context.globalAlpha = PANEL_ALPHA * alpha;
  box(context, MINIMAP.frame[0], [x - 2, y - 2, width + 4, height + 4]);
  box(context, MINIMAP.panel, [x, y, width, height]);
  context.globalAlpha = alpha;
  box(context, MINIMAP.frame[1], [x - 1, y - 1, width + 2, 1]);
  box(context, MINIMAP.frame[2], [x - 1, y - 1, 1, 1]);
}

function drawLines(context, pitch, area) {
  const { x, y, width, height } = area;
  const boxDepth = Math.round(width * 0.14);
  const boxWidth = Math.round(height * 0.5);

  for (let i = 0; i < STRIPES; i += 1) {
    box(context, MINIMAP.grass[i % 2], [x + (width * i) / STRIPES, y, width / STRIPES + 1, height]);
  }

  box(context, MINIMAP.line, [x, y, width, 1]);
  box(context, MINIMAP.line, [x, y + height - 1, width, 1]);
  box(context, MINIMAP.line, [x, y, 1, height]);
  box(context, MINIMAP.line, [x + width - 1, y, 1, height]);
  box(context, MINIMAP.line, [x + Math.floor(width / 2), y, 1, height]);

  for (const left of [x, x + width - boxDepth]) {
    const top = y + Math.round((height - boxWidth) / 2);

    box(context, MINIMAP.line, [left, top, boxDepth, 1]);
    box(context, MINIMAP.line, [left, top + boxWidth - 1, boxDepth, 1]);
    box(context, MINIMAP.line, [left === x ? x + boxDepth - 1 : left, top, 1, boxWidth]);
  }
}

// a dark shirt (black, navy) would sink into the grass inside a dark edge: it gets a light one
const HALO_UNDER = 130;

const edgeOf = (colour) =>
  colourGap(colour, MINIMAP.grass[0]) < HALO_UNDER ? MINIMAP.halo : MINIMAP.outline;

function dot(context, { x, y }, colour, size = DOT) {
  box(context, edgeOf(colour), [x - 1, y - 1, size + 2, size + 2]);
  box(context, colour, [x, y, size, size]);
}

// `alpha` fades the whole radar while play passes under it (minimap-fade.js)
export function drawMinimap(context, match, rect, { alpha = 1 } = {}) {
  const inner = { x: rect.x + 2, y: rect.y + 2, width: rect.width - 4, height: rect.height - 4 };
  const at = (point) => ({
    x: Math.round(inner.x + (point.x / match.pitch.length) * (inner.width - DOT)),
    y: Math.round(inner.y + (point.y / match.pitch.width) * (inner.height - DOT)),
  });
  const kits = matchKits(match);

  drawPanel(context, rect, alpha);
  drawLines(context, match.pitch, inner);

  for (const player of match.players) {
    const kit = kits[player.team];
    const shirt = player.role === 'keeper' ? kit.keeper.shirt : kit.outfield.shirt;

    dot(context, at(player), shirt[2]);
  }

  const steered = match.players[match.controlled ?? -1];

  if (steered) {
    const spot = at(steered);

    box(context, MINIMAP.steered[(match.tick >> 4) & 1], [
      spot.x - 2,
      spot.y - 2,
      DOT + 4,
      DOT + 4,
    ]);
    dot(
      context,
      spot,
      kits[steered.team].outfield.shirt[3] ?? kits[steered.team].outfield.shirt[2],
    );
  }

  dot(context, at(match.ball), MINIMAP.ball);
  context.globalAlpha = 1;
}
