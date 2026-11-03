import { stamp } from './grid.js';

// light from the top left: the nose shows as the shade on its right and the shadow under its tip
export const NOSES = {
  button: ['.3', '34'],
  small: ['..3', '..3', '.34'],
  straight: ['1.3', '1.3', '1.3', '.343'],
  strong: ['1.3.', '1.3.', '1.33', '3443'],
  broad: ['..3.', '..3.', '1.33', '34.43'],
  wide: ['..3..', '..3..', '1..3.', '34.43'],
};

export function paintNose(grid, { name, y }) {
  stamp(grid, NOSES[name], { x: 30, y });
}
