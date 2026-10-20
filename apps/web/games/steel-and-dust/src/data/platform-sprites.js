// the platforms are PixelLab sprites in assets/sprites/platforms/, drawn at the fighters' density.
// `topY` is the sprite row a fighter stands on; a deck's legs grow down to the ground by repeating
// the sprite's last row, so one sprite fits any height. A log has no legs and lies on the road,
// `rise` above it
export const PLATFORM_SPRITES = {
  planks: { file: 'planks.png', width: 80, topY: 7, legs: [11, 68] },
  log: { file: 'log.png', width: 80, topY: 6, rise: 17 },
};
