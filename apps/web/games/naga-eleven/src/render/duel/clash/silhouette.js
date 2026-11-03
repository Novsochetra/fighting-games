import { FIGURE_ART } from '../../../art/duel/looks.js';
import { FIGURE_SCALE, POSES } from '../poses.js';
import { band, disc, ellipse, polygon } from '../shapes.js';

const SCALE = FIGURE_SCALE;

export const jointAt = (place, [px, py]) => ({
  x: place.x + px * SCALE * place.facing,
  y: place.y + py * SCALE,
});

// hair standing up at the front in thick spikes, in head sizes: along the facing, then down
const HAIR = [
  [-1.05, 0.1],
  [-1.5, -0.9],
  [-0.7, -0.8],
  [-0.9, -1.75],
  [-0.15, -1.05],
  [0.2, -1.9],
  [0.55, -0.95],
  [1.25, -1.35],
  [0.95, -0.35],
];

function limb(pen, place, [joint, end], { from, color, widths }) {
  const middle = jointAt(place, joint);
  const tip = jointAt(place, end);

  band(pen, { from: jointAt(place, from), to: middle, width: widths[0], color });
  band(pen, { from: middle, to: tip, width: widths[1], color });
  disc(pen, { ...middle, radius: widths[0] / 2, color });

  return tip;
}

function boot(pen, place, foot, color) {
  ellipse(pen, {
    x: foot.x + place.facing * SCALE,
    y: foot.y - 0.4 * SCALE,
    radiusX: 2.1 * SCALE,
    radiusY: 1.2 * SCALE,
    color,
  });
}

function torso(pen, place, pose, color) {
  const neck = jointAt(place, pose.neck);
  const hip = jointAt(place, pose.hip);
  const across = 2.9 * SCALE;
  const waist = 2.2 * SCALE;

  polygon(
    pen,
    [
      [neck.x - across, neck.y + SCALE],
      [neck.x + across, neck.y + SCALE],
      [hip.x + waist, hip.y],
      [hip.x - waist, hip.y],
    ],
    color,
  );
  disc(pen, { x: neck.x, y: neck.y + 1.4 * SCALE, radius: across * 0.9, color });
  ellipse(pen, {
    x: hip.x,
    y: hip.y + 0.6 * SCALE,
    radiusX: waist * 1.25,
    radiusY: 1.8 * SCALE,
    color,
  });
}

function head(pen, place, pose, color) {
  const centre = jointAt(place, pose.head);
  const size = 2.7 * SCALE;
  const along = place.facing;

  disc(pen, { ...centre, radius: size, color });
  polygon(
    pen,
    HAIR.map(([forward, down]) => [centre.x + along * forward * size, centre.y + down * size]),
    color,
  );
}

function shape(pen, place, pose, colors) {
  const arms = { from: pose.neck, widths: [2.2 * SCALE, 1.8 * SCALE] };
  const legs = { from: pose.hip, widths: [3.3 * SCALE, 2.4 * SCALE] };

  limb(pen, place, pose.arms.back, { ...arms, color: colors.back });
  boot(pen, place, limb(pen, place, pose.legs.back, { ...legs, color: colors.back }), colors.back);
  torso(pen, place, pose, colors.body);
  head(pen, place, pose, colors.body);
  boot(pen, place, limb(pen, place, pose.legs.front, { ...legs, color: colors.body }), colors.body);

  const hand = limb(pen, place, pose.arms.front, { ...arms, color: colors.body });

  disc(pen, { ...hand, radius: 1.3 * SCALE, color: colors.body });
}

// a shadow lit along its top and its leading edge by the light of the move behind it, as the
// penalty show draws a player, and the clash while no sheets are loaded; `body` tints it, for an
// afterimage
export function drawSilhouette(
  pen,
  { pose = 'stand', x, y, facing = 1, rim = FIGURE_ART.rim, body },
) {
  const joints = POSES[pose] ?? POSES.stand;
  const place = { x, y, facing };
  const lit = { x: x - facing * 2, y: y - 2, facing };

  shape(pen, lit, joints, { body: rim, back: rim });
  shape(pen, place, joints, { body: body ?? FIGURE_ART.body, back: body ?? FIGURE_ART.shade });
}
