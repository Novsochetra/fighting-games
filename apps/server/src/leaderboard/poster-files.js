import { randomBytes } from 'node:crypto';

// Every game's run poster has the shape of a link preview (1200x630), and goes up with a square
// avatar of the run cut out of it, so the board loads only what it shows: the avatar in a row, the
// poster 640 wide for the board's first place, and the whole poster, PNG so its pixels stay crisp,
// only once a player opens it. A size that has shipped keeps its file name, since the posters
// already up are found by it.
export const POSTER_SIZES = [
  { name: 'avatar', width: 192, height: 192, type: 'image/jpeg', ext: 'jpg', maxBytes: 30_000 },
  { name: 'medium', width: 640, height: 336, type: 'image/jpeg', ext: 'jpg', maxBytes: 120_000 },
  { name: 'large', width: 1200, height: 630, type: 'image/png', ext: 'png', maxBytes: 400_000 },
];

// a random name, so a poster taken off the board is found by nobody who did not already have it
export const newPosterKey = (game) => `posters/${game}/${randomBytes(12).toString('hex')}`;

export const posterFileKey = (posterKey, size) => `${posterKey}-${size.width}.${size.ext}`;

export function posterImages(posterKey, urlOf) {
  const urlAt = (size) => urlOf(posterFileKey(posterKey, size));
  const posterSizes = POSTER_SIZES.filter((size) => size.name !== 'avatar');

  return {
    avatar: urlAt(POSTER_SIZES[0]),
    images: posterSizes.map((size) => ({ width: size.width, url: urlAt(size) })),
  };
}

export const base64Length = (bytes) => Math.ceil(bytes / 3) * 4;
