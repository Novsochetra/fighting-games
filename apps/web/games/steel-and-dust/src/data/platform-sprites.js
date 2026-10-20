// the plank decks and the iron catwalks are PixelLab sprites in assets/sprites/platforms/, drawn at
// the fighters' density. `topY` is the sprite row a fighter stands on; the deck's legs grow down to
// the ground by repeating the sprite's last row, so one sprite fits any height
export const PLATFORM_SPRITES = {
  planks: { file: 'planks.png', width: 80, topY: 7, legs: [11, 68] },
  scaffold: { file: 'scaffold.png', width: 80, topY: 6, legs: [11, 68] },
  catwalk: { file: 'catwalk.png', width: 80, topY: 4, legs: [10, 68] },
  rampart: { file: 'rampart.png', width: 80, topY: 5, legs: [9, 71] },
  slab: { file: 'slab.png', width: 80, topY: 2, legs: [37, 43] },
};
