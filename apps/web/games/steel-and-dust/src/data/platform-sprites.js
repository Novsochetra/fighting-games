// the plank decks are a PixelLab sprite in assets/sprites/platforms/, drawn at the fighters'
// density. `topY` is the sprite row a fighter stands on; the deck's legs grow down to the ground
// by repeating the sprite's last row, so one sprite fits any height
export const PLATFORM_SPRITES = {
  planks: { file: 'planks.png', width: 80, topY: 7, legs: [11, 68] },
  rampart: { file: 'rampart.png', width: 80, topY: 5, legs: [9, 71] },
};
