// the loot strips in assets/sprites/loot/: one row of frames each. `scale` is world pixels per strip
// pixel: at 0.5 a strip pixel is one screen pixel, the fighters' density, for coins, gems and
// apples; at 1 it is two, the crates' chunkier density, for the chest a boss leaves in a crate's place
export const LOOT_SPRITES = {
  coin: { file: 'coin.png', frameWidth: 16, frameHeight: 16, frames: 6, ticks: 5, scale: 0.5 },
  gem: { file: 'gem.png', frameWidth: 16, frameHeight: 16, frames: 4, ticks: 6, scale: 0.5 },
  apple: { file: 'apple.png', frameWidth: 16, frameHeight: 16, frames: 1, ticks: 1, scale: 0.5 },
  sparkle: {
    file: 'sparkle.png',
    frameWidth: 16,
    frameHeight: 16,
    frames: 5,
    ticks: 3,
    scale: 0.5,
  },
  chest: { file: 'chest.png', frameWidth: 32, frameHeight: 32, frames: 4, ticks: 1, scale: 1 },
};

export const CHEST_FRAMES = { closed: 0, rattle: 1, opening: 2, open: 3 };
