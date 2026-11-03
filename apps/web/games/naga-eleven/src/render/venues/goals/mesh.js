import { line } from '../kit/raster.js';

// a net as a grid of strings over one face of the goal: `at(across, up)` gives the view point of a
// spot on the face, both shares 0 to 1, and the strings run `columns` one way and `rows` the other
export function paintMesh(raster, { at, columns, rows, colour, skip = () => false }) {
  for (let i = 0; i <= columns; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      if (!skip(i, j)) {
        line(raster, at(i / columns, j / rows), at(i / columns, (j + 1) / rows), colour);
      }
    }
  }

  for (let j = 0; j <= rows; j += 1) {
    for (let i = 0; i < columns; i += 1) {
      if (!skip(i, j + 0.5)) {
        line(raster, at(i / columns, j / rows), at((i + 1) / columns, j / rows), colour);
      }
    }
  }
}
