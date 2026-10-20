// the plank decks are a PixelLab sprite in assets/sprites/platforms/, drawn at the fighters'
// density. `topY` is the sprite row a fighter stands on; the deck's legs grow down to the ground
// by repeating the sprite's last row, so one sprite fits any height. The braced trestle under the
// planks runs into the posts before that last row, which is the two posts alone. The night deck
// is the same trestle in Firefly Hollow's moonlight
export const PLATFORM_SPRITES = {
  planks: { file: 'planks.png', width: 80, topY: 6, legs: [11, 68] },
  'planks-night': { file: 'planks-night.png', width: 80, topY: 6, legs: [11, 68] },
};
