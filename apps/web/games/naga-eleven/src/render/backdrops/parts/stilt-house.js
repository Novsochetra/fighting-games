import { fillRect, hline, plot, vline } from '../raster.js';
import { line, polygon } from '../shapes.js';

// The Khmer house, phteah: a wooden room high on posts, the shade and the water jars under it, a
// steep roof with a skirt below and horned ends. `colors` = { post, wall, board, roof, roofLine,
// rim, window, lamp, jar }; `light` -1 or 1 is the side the low sun rims; `lit` names the windows
// a lamp burns in.

function paintPosts(raster, { x, ground, width, floor, colors, light }) {
  const count = Math.max(3, Math.round(width / 16));

  for (let i = 0; i < count; i += 1) {
    const postX = Math.round(x + 3 + (i * (width - 8)) / (count - 1));

    fillRect(raster, { x: postX, y: floor, width: 2, height: ground - floor }, colors.post);
    vline(
      raster,
      { x: postX + (light > 0 ? 1 : 0), y: floor + 2, length: ground - floor - 2 },
      colors.rim,
    );
  }
}

function paintUnderneath(raster, { x, ground, width, floor, colors }) {
  const sag = Math.round((ground - floor) * 0.45);

  for (let i = 0; i <= 14; i += 1) {
    const along = i / 14;

    plot(
      raster,
      x + 8 + Math.round(along * 16),
      floor + 3 + Math.round(sag * 4 * along * (1 - along)),
      colors.rim,
    );
  }

  [0.62, 0.72].forEach((at, i) => {
    const jarX = Math.round(x + width * at);

    fillRect(raster, { x: jarX - 2, y: ground - 5 + i, width: 5, height: 5 - i }, colors.jar);
    hline(raster, { x: jarX - 1, y: ground - 6 + i, length: 3 }, colors.jar);
    plot(raster, jarX + 1, ground - 4 + i, colors.rim);
  });
}

function paintWalls(raster, { x, width, floor, wallTop, colors, windows, panes }) {
  fillRect(
    raster,
    { x: x + 1, y: wallTop, width: width - 2, height: floor - wallTop },
    colors.wall,
  );

  for (let boardX = x + 3; boardX < x + width - 2; boardX += 4) {
    vline(raster, { x: boardX, y: wallTop + 1, length: floor - wallTop - 1 }, colors.board);
  }

  hline(raster, { x: x - 1, y: floor, length: width + 2 }, colors.post);
  hline(raster, { x: x - 1, y: floor + 1, length: width + 2 }, colors.board);
  panes.forEach((pane, i) => paintWindow(raster, { pane, lit: windows[i].lit, colors }));
}

function paintWindow(raster, { pane, lit, colors }) {
  fillRect(raster, pane, lit ? colors.lamp : colors.window);
  fillRect(raster, { ...pane, x: pane.x - 3, width: 3 }, colors.board);
  fillRect(raster, { ...pane, x: pane.x + pane.width, width: 3 }, colors.board);
  vline(raster, { x: pane.x + 3, y: pane.y, length: pane.height }, colors.post);
}

function paintRoofLines(raster, { x, width, ridge, skirt, inset, color }) {
  for (let rowY = ridge + 3; rowY < skirt; rowY += 3) {
    const along = (rowY - ridge) / (skirt - ridge);
    const left = Math.round(x + inset - (inset + 4) * along) + 1;

    hline(
      raster,
      { x: left, y: rowY, length: Math.round(width - 2 * inset + (2 * inset + 8) * along) - 2 },
      color,
    );
  }
}

function paintRidge(raster, { x, width, ridge, skirt, inset, colors, light }) {
  const [left, right] = [x + inset, x + width - inset];
  const end =
    light > 0
      ? { from: { x: right, y: ridge }, to: { x: x + width + 4, y: skirt } }
      : { from: { x: left, y: ridge }, to: { x: x - 4, y: skirt } };

  hline(raster, { x: left, y: ridge, length: right - left }, colors.rim);
  line(raster, end, colors.rim);
  [left, right].forEach((hornX, i) => {
    line(
      raster,
      { from: { x: hornX, y: ridge }, to: { x: hornX + (i ? 2 : -2), y: ridge - 3 } },
      colors.post,
    );
  });
}

function paintRoof(raster, { x, width, wallTop, colors, light }) {
  const eave = wallTop + 1;
  const skirt = eave - 4;
  const ridge = skirt - Math.round(width * 0.32);
  const inset = Math.round(width * 0.22);

  polygon(
    raster,
    [x - 8, eave, x + width + 8, eave, x + width + 3, skirt, x - 3, skirt],
    colors.roof,
  );
  hline(raster, { x: x - 8, y: eave, length: width + 16 }, colors.roofLine);
  polygon(
    raster,
    [x - 4, skirt, x + width + 4, skirt, x + width - inset, ridge, x + inset, ridge],
    colors.roof,
  );
  paintRoofLines(raster, { x, width, ridge, skirt, inset, color: colors.roofLine });
  paintRidge(raster, { x, width, ridge, skirt, inset, colors, light });
}

function paintLadder(raster, { x, ground, floor, colors }) {
  line(raster, { from: { x: x - 10, y: ground }, to: { x: x - 2, y: floor + 1 } }, colors.post);
  line(raster, { from: { x: x - 7, y: ground }, to: { x: x + 1, y: floor + 1 } }, colors.post);

  for (let rung = floor + 4; rung < ground; rung += 3) {
    const along = (rung - floor) / (ground - floor);

    hline(raster, { x: Math.round(x - 1 - 8 * along), y: rung, length: 3 }, colors.board);
  }
}

const floorOf = ({ ground, width }) => ground - Math.round(width * 0.24);

const wallTopOf = (house) => floorOf(house) - Math.round(house.width * 0.2);

// the window panes, in art pixels, for a lamp that flickers in them
export const houseWindows = (house) =>
  (house.windows ?? []).map((spot) => ({
    x: Math.round(house.x + house.width * spot.at) - 3,
    y: wallTopOf(house) + 3,
    width: 7,
    height: 6,
  }));

export function paintStiltHouse(raster, house) {
  const { x, ground, width, colors, light = 1, windows = [] } = house;
  const floor = floorOf(house);
  const wallTop = wallTopOf(house);
  const frame = {
    x,
    ground,
    width,
    floor,
    wallTop,
    colors,
    light,
    windows,
    panes: houseWindows(house),
  };

  paintPosts(raster, frame);
  paintUnderneath(raster, frame);
  paintWalls(raster, frame);
  paintRoof(raster, frame);
  paintLadder(raster, frame);
}
