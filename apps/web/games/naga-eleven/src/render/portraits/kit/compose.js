import { createGrid, inside, setCell } from '../grid.js';
import { cellOf } from './decode.js';
import { hatCover, withoutScraps } from './hats.js';

// room over the skull for the tallest hair, the shoulders cut by the foot of the frame
export const SKULL_AT = { x: 31, y: 14 };

function cellsOf(part, at) {
  const cells = [];

  for (let y = 0; y < part.height; y += 1) {
    for (let x = 0; x < part.width; x += 1) {
      const letter = cellOf(part, x, y);

      if (letter && inside(at.x + x, at.y + y)) {
        cells.push({ x: at.x + x, y: at.y + y, letter });
      }
    }
  }

  return cells;
}

// a layer is placed from the face's own corner, so the two roundings never pull it a pixel off
function layerAt(face, faceAt, layer) {
  return {
    x: faceAt.x + Math.round(face.anchor.x - layer.anchor.x),
    y: faceAt.y + Math.round(face.anchor.y - layer.anchor.y),
  };
}

function shownHair(hairCells, gearCells, covers) {
  if (!covers) {
    return hairCells;
  }

  const hidden = hatCover(gearCells, SKULL_AT.x);

  return withoutScraps(hairCells.filter((cell) => !hidden(cell)));
}

export function kitLayers({ face, hair = null, gear = null }) {
  const faceAt = {
    x: Math.round(SKULL_AT.x - face.anchor.x),
    y: Math.round(SKULL_AT.y - face.anchor.y),
  };

  return {
    faceCells: cellsOf(face, faceAt),
    hairCells: hair ? cellsOf(hair, layerAt(face, faceAt, hair)) : [],
    gearCells: gear ? cellsOf(gear, layerAt(face, faceAt, gear)) : [],
  };
}

export function composeKitFace({ face, hair = null, gear = null, covers = false }) {
  const grid = createGrid();
  const { faceCells, hairCells, gearCells } = kitLayers({ face, hair, gear });

  for (const { x, y, letter } of [
    ...faceCells,
    ...shownHair(hairCells, gearCells, covers),
    ...gearCells,
  ]) {
    setCell(grid, x, y, letter);
  }

  return grid;
}
