import { FX_COLORS } from '../../art/fx-colors.js';
import { BODY_ART } from '../../art/weapon-art.js';
import { DROP } from '../../data/ambush.js';
import { ENEMY_TYPES } from '../../data/enemies/enemy-types.js';
import { clamp } from '../../lib/math.js';

// a fighter's own shadow on the road (draw-fighter.js), which this one turns into as it lands
const OWN_ALPHA = 0.35;
const OWN_WIDTH = 14;
const GATHER = DROP.warn - DROP.ready;
// from this high the falling raider's shadow is as soft as it was before it let go, and over the
// last stretch it fades into the raider's own
const FALL = 120;
const HANDOVER = 16;
// the rows the shadow lies on, from the floor line down the turf toward the viewer, each as wide
// and as dark as a share of the first two, the rows the raider's own shadow lies on; the soft
// rows and the rounded ends go as it comes down
const ROWS = [
  { dy: 0, reach: 1, shade: 1, soft: false },
  { dy: 1, reach: 1, shade: 1, soft: false },
  { dy: 2, reach: 0.7, shade: 0.55, soft: true },
  { dy: 3, reach: 0.4, shade: 0.3, soft: true },
];
// the last stretch of each row fades, so its ends are rounded off
const FADE_FROM = 0.75;

const scaleOf = (mark) => mark.raider?.scale ?? ENEMY_TYPES[mark.raiderKind]?.scale ?? 1;

// how wide and dark the shadow is: a faint wide smudge gathering while the raider settles
// overhead, drawing in and darkening as it gets ready, then sharpening as it comes down
export function dropShadow(mark) {
  const foot = (OWN_WIDTH * scaleOf(mark)) / 2;

  if (mark.raider) {
    const height = clamp((mark.y - mark.raider.y) / FALL, 0, 1);

    return { half: foot + 3 * height, darkness: 0.85 - 0.3 * height, soft: height };
  }

  const grown = Math.min(1, mark.time / GATHER);
  const ready = clamp((mark.time - GATHER) / DROP.ready, 0, 1);

  return {
    half: foot * 0.6 + (foot * 0.4 + 5) * grown - 2 * ready,
    darkness: 0.3 * grown + 0.25 * ready,
    soft: 1,
  };
}

function shadeAt(row, { across, soft }) {
  if (across > row.reach) {
    return 0;
  }

  const fade = Math.max(0, (across / row.reach - FADE_FROM) / (1 - FADE_FROM));

  return row.shade * (row.soft ? soft : 1) * (1 - 0.5 * fade * soft);
}

// one row of the shadow, laid in runs of columns alike, on the same floor and just as dark, so a
// shadow is a few rectangles a frame rather than one for every pixel of it
function drawRow(painter, row, { columns, soft, darkness, strength }) {
  let run = null;

  for (const { x, across, floor } of columns) {
    const shade = shadeAt(row, { across, soft }) * darkness * strength;
    const y = floor + row.dy;

    if (run && run.shade === shade && run.y === y && run.x + run.width === x) {
      run.width++;
      continue;
    }

    if (run) {
      painter.alpha(run.shade).rect(run.x, run.y, run.width, 1);
    }

    run = shade > 0 ? { x, y, width: 1, shade } : null;
  }

  if (run) {
    painter.alpha(run.shade).rect(run.x, run.y, run.width, 1);
  }
}

// the shadow deepens what it lies on instead of painting over it, so grass stays grass and sand
// stays sand, only darker; and it lies on whatever the light from overhead meets in each column,
// the turf as it is drawn or a deck, so it drapes over a hump instead of floating over it
function drawLaid(painter, mark, { floorAt, strength }) {
  const { half, darkness, soft } = dropShadow(mark);
  const centerX = Math.round(mark.x);
  const reach = Math.ceil(half);
  const columns = [];

  for (let x = centerX - reach; x < centerX + reach; x++) {
    columns.push({ x, across: Math.abs(x + 0.5 - centerX) / half, floor: floorAt(x) });
  }

  painter.context.globalCompositeOperation = 'multiply';
  painter.use(FX_COLORS.dropShadow);
  for (const row of ROWS) {
    drawRow(painter, row, { columns, soft, darkness, strength });
  }

  painter.context.globalCompositeOperation = 'source-over';
}

// the raider's own shadow as draw-fighter.js lays it, for the last stretch of the fall
function drawOwn(painter, mark, share) {
  const height = mark.y - mark.raider.y;
  const width = Math.max(6, Math.round(OWN_WIDTH * scaleOf(mark) - height * 0.12));

  painter.alpha(OWN_ALPHA * share).use(BODY_ART.shadow);
  painter.rect(mark.raider.x - width / 2, mark.y, width, 2);
}

export function drawDropShadow(painter, mark, floorAt) {
  const near = mark.raider ? clamp((mark.y - mark.raider.y) / HANDOVER, 0, 1) : 1;

  drawLaid(painter, mark, { floorAt, strength: near });
  if (near < 1) {
    drawOwn(painter, mark, 1 - near);
  }

  painter.alpha(1);
}
