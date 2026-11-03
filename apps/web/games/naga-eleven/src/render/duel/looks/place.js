import { pointsOf } from '../points.js';

// a point of a figure drawn in its own units (x forward, y down from its foot), turned the way it
// faces, scaled and leant
export function placer({ x, y, size = 1, facing = 1, angle = 0 }) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return (across, down) => {
    const ax = across * size * facing;
    const ay = down * size;

    return [x + ax * cos - ay * sin, y + ax * sin + ay * cos];
  };
}

export const poly = (point, corners, color, ink = true) => ({
  kind: 'poly',
  points: pointsOf(corners).map(([across, down]) => point(across, down)),
  color,
  ink,
});

// an oval of the figure's own units, leant by `turn`, as a polygon so it turns with the figure
export function oval(point, { at: [cx, cy], radius: [rx, ry], turn = 0, color, ink = true }) {
  const points = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const ox = Math.cos(angle) * rx;
    const oy = Math.sin(angle) * ry;

    return point(
      cx + ox * Math.cos(turn) - oy * Math.sin(turn),
      cy + ox * Math.sin(turn) + oy * Math.cos(turn),
    );
  });

  return { kind: 'poly', points, color, ink };
}

// a limb or a trunk: bands through points of the figure's units ('x,y x,y …'), thinning as given
export function limbParts(point, { through, widths, color, size = 1, ink = true }) {
  const joints = typeof through === 'string' ? pointsOf(through) : through;

  return joints.slice(1).map((end, i) => {
    const [fx, fy] = point(...joints[i]);
    const [tx, ty] = point(...end);

    return {
      kind: 'band',
      from: { x: fx, y: fy },
      to: { x: tx, y: ty },
      width: widths[i] * size,
      color,
      ink,
    };
  });
}

export const joint = (point, { at: [across, down], radius, color, ink = true }) => {
  const [x, y] = point(across, down);

  return { kind: 'disc', x, y, radius, color, ink };
};
