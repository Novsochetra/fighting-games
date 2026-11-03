import { fillQuad, line, rect } from '../kit/raster.js';
import { paintMesh } from './mesh.js';
import { bulgeOf, pointOf } from './shape.js';

// each face of the net, as the point of the view a share across and a share up it lands on
function faces(camera, shape, ripple, origin) {
  const { line: front, back, far, near, height, backHeight } = shape;
  const at = (point) => {
    const spot = pointOf(camera, shape, point);

    return { x: spot.x - origin.x, y: spot.y - origin.y };
  };
  const along = (share) => front + (back - front) * share;
  const roofAt = (share) => height + (backHeight - height) * share;
  const side = (y) => (across, up) => at({ x: along(across), y, z: up * roofAt(across) });

  return {
    back: (across, up) => {
      const y = far + (near - far) * across;
      const lift = up * backHeight - shape.sag * Math.sin(across * Math.PI) * up;

      return at({ x: back, y, z: lift, out: bulgeOf(ripple, { y, z: lift }) });
    },
    roof: (across, up) => at({ x: along(across), y: far + (near - far) * up, z: roofAt(across) }),
    far: side(far),
    near: side(near),
    at,
  };
}

// a post as a stroke three pixels wide, lit on its left and outlined dark on its right; bamboo is
// ringed with a node every few pixels
function paintPost(raster, { foot, top, nodes }, colours) {
  const height = foot.y - top.y + 1;

  rect(raster, { x: foot.x - 1, y: top.y, width: 1, height }, colours[3]);
  rect(raster, { x: foot.x, y: top.y, width: 1, height }, colours[2]);
  rect(raster, { x: foot.x + 1, y: top.y, width: 1, height }, colours[1]);
  rect(raster, { x: foot.x + 2, y: top.y + 1, width: 1, height }, colours[0]);

  for (let y = top.y + 5; nodes && y < foot.y - 1; y += 7) {
    rect(raster, { x: foot.x - 1, y, width: 3, height: 1 }, colours[0]);
    rect(raster, { x: foot.x - 1, y: y + 1, width: 2, height: 1 }, colours[3]);
  }
}

function paintBar(raster, from, to, colours) {
  line(raster, { x: from.x, y: from.y + 2 }, { x: to.x, y: to.y + 2 }, colours[0]);
  line(raster, { x: from.x, y: from.y + 1 }, { x: to.x, y: to.y + 1 }, colours[1]);
  line(raster, from, to, colours[2]);
  line(raster, { x: from.x, y: from.y - 1 }, { x: to.x, y: to.y - 1 }, colours[3]);
}

function crossbar(raster, { face, shape, colours }) {
  const far = face.at({ x: shape.line, y: shape.far, z: shape.height });
  const near = face.at({ x: shape.line, y: shape.near, z: shape.height });
  const middle = {
    x: Math.round((far.x + near.x) / 2),
    y: Math.round((far.y + near.y) / 2) + shape.sag,
  };

  paintBar(raster, far, middle, colours);
  paintBar(raster, middle, near, colours);
}

// the net's shadow on the grass, and a faint veil over its back and far side, so it reads as a
// cage of string and not as loose lines
function paintVeils(raster, face, style) {
  const ground = [face.far(0, 0), face.far(1, 0), face.near(1, 0), face.near(0, 0)];

  fillQuad(raster, ground, style.shadow);
  fillQuad(
    raster,
    [face.back(0, 0), face.back(1, 0), face.back(1, 1), face.back(0, 1)],
    style.veil,
  );
  fillQuad(raster, [face.far(0, 0), face.far(1, 0), face.far(1, 1), face.far(0, 1)], style.veil);
}

export function paintGoalBack(raster, { camera, shape, ripple, origin, style }) {
  const face = faces(camera, shape, ripple, origin);
  const mesh = { colour: style.net, skip: style.skip };

  paintVeils(raster, face, style);

  paintMesh(raster, { ...mesh, at: face.back, columns: style.columns, rows: style.rows });
  paintMesh(raster, { ...mesh, at: face.roof, columns: 3, rows: style.columns });
  paintMesh(raster, { ...mesh, at: face.far, columns: 3, rows: style.rows });
  line(raster, face.back(0, 0), face.back(1, 0), style.stay);
  paintPost(
    raster,
    {
      foot: face.at({ x: shape.line, y: shape.far, z: 0 }),
      top: face.at({ x: shape.line, y: shape.far, z: shape.height }),
      nodes: style.nodes,
    },
    style.post,
  );
}

export function paintGoalFront(raster, { camera, shape, ripple, origin, style }) {
  const face = faces(camera, shape, ripple, origin);

  paintMesh(raster, {
    colour: style.netNear,
    skip: style.skip,
    at: face.near,
    columns: 3,
    rows: style.rows,
  });
  paintPost(
    raster,
    {
      foot: face.at({ x: shape.line, y: shape.near, z: 0 }),
      top: face.at({ x: shape.line, y: shape.near, z: shape.height }),
      nodes: style.nodes,
    },
    style.post,
  );
  crossbar(raster, { face, shape, colours: style.post });
}
