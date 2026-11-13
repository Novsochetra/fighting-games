import { disc, polygon } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { easeOut } from '../../tracks/ease.js';
import { dithered, ellipseDots, ellipseOutline, spark } from './kit.js';

const SPIKES = 12;

const STAR_FRAMES = [
  { size: 34, outer: SHOT_ART.flash, inner: SHOT_ART.white, core: 8 },
  { size: 30, outer: SHOT_ART.gold[3], inner: SHOT_ART.white, core: 5, accent: SHOT_ART.ember[3] },
  { size: 22, outer: SHOT_ART.emerald[4], inner: SHOT_ART.gold[3], core: 3 },
  { size: 13, outer: SHOT_ART.emerald[3], inner: SHOT_ART.emerald[4], core: 0 },
];

function spikesOf({ at, size, turn, ahead }) {
  return Array.from({ length: SPIKES }, (_, i) => {
    const angle = (i / SPIKES) * Math.PI * 2 + turn;
    const forward = Math.max(0, Math.cos(angle - ahead));
    const reach = size * (i % 2 === 0 ? 1 : 0.5) * (1 + forward * 0.6);
    const side = angle + Math.PI / 2;
    const base = i % 2 === 0 ? 3 : 2;

    return {
      long: i % 2 === 0,
      points: [
        [at.x + Math.cos(side) * base, at.y + Math.sin(side) * base],
        [at.x + Math.cos(angle) * reach, at.y + Math.sin(angle) * reach],
        [at.x - Math.cos(side) * base, at.y - Math.sin(side) * base],
      ],
    };
  });
}

function star(pen, { at, size, turn, ahead, color, accent }) {
  spikesOf({ at, size, turn, ahead }).forEach(({ long, points }) => {
    polygon(pen, points, !long && accent ? accent : color);
  });
}

export function drawStarBurst(pen, { at, hit, ahead }) {
  const frame = STAR_FRAMES[Math.floor(hit / 2)];

  if (hit < 0) {
    return;
  }

  if (!frame) {
    if (hit < 11) {
      spark(pen, { ...at, reach: 2, core: SHOT_ART.white, arm: SHOT_ART.emerald[3] });
    }

    return;
  }

  const turn = Math.floor(hit / 2) * 0.27;

  star(pen, { at, size: frame.size, turn, ahead, color: frame.outer, accent: frame.accent });
  star(pen, { at, size: frame.size * 0.55, turn: turn + 0.26, ahead, color: frame.inner });

  if (frame.core) {
    disc(pen, { x: at.x, y: at.y, radius: frame.core, color: SHOT_ART.white });
  }
}

const AIR_BANDS = [SHOT_ART.white, SHOT_ART.gold[3], SHOT_ART.emerald[4]];

export function drawAirRing(pen, { at, hit, life = 13, reach = 40 }) {
  const share = hit / life;

  if (share < 0 || share >= 1) {
    return;
  }

  const radius = 7 + reach * easeOut(share);
  const bands = [3, 2, 1][Math.min(2, Math.floor(share / 0.35))];

  for (let band = 0; band < bands; band += 1) {
    const color = band === 0 && share > 0.25 ? SHOT_ART.gold[3] : AIR_BANDS[band];

    ellipseDots(pen, {
      x: at.x,
      y: at.y,
      radiusX: radius - band,
      radiusY: (radius - band) * 0.88,
      pick: (angle, x, y) => (dithered(x, y, 1.6 - share * 1.6) ? color : null),
    });
  }
}

export function drawGroundRing(pen, { at, ground, hit, life = 22, reach = 84 }) {
  const share = hit / life;

  if (share < 0 || share >= 1) {
    return;
  }

  const radius = 8 + reach * easeOut(share);

  [0, 3].forEach((inset, band) => {
    ellipseOutline(pen, {
      x: at.x,
      y: ground,
      radiusX: radius - inset,
      radiusY: (radius - inset) * 0.2,
      pick: (angle, x, y) => {
        if (!dithered(x, y, 1.1 - share - band * 0.3)) {
          return null;
        }

        return Math.sin(angle) > 0
          ? [SHOT_ART.gold[3], SHOT_ART.emerald[4]][band]
          : SHOT_ART.emerald[3];
      },
    });
  });
}
