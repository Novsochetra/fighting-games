// the decks are PixelLab sprites in assets/sprites/platforms/ (plank decks in the forests,
// sandstone ledges on the temple roads), drawn at the fighters' density. `topY` is the sprite row
// a fighter stands on; each half of the sprite's last row is stretched down to the ground under
// the leg at `legs` (world px from the left end), so one sprite fits any height
export const PLATFORM_SPRITES = {
  planks: { file: 'planks.png', width: 80, topY: 7, legs: [11, 68] },
  ledge: { file: 'ledge.png', width: 80, topY: 3, legs: [12, 67] },
};
