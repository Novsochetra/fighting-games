import { randomBytes } from 'node:crypto';

// Every game's run poster has the shape of a link preview (1200x630), and goes up in three sizes so
// the board loads the smallest one sharp where it shows it: a row's, the podium's, and the whole
// poster, PNG so its pixels stay crisp, only once a player taps it. A size that has shipped keeps
// its file name, since the posters already up are found by it.
export const POSTER_SIZES = [
  { name: 'small', width: 320, height: 168, type: 'image/jpeg', ext: 'jpg', maxBytes: 40_000 },
  { name: 'medium', width: 640, height: 336, type: 'image/jpeg', ext: 'jpg', maxBytes: 120_000 },
  { name: 'large', width: 1200, height: 630, type: 'image/png', ext: 'png', maxBytes: 400_000 },
];

// a random name, so a poster taken off the board is found by nobody who did not already have it
export const newPosterKey = (game) => `posters/${game}/${randomBytes(12).toString('hex')}`;

export const posterFileKey = (posterKey, size) => `${posterKey}-${size.width}.${size.ext}`;

export function posterImages(posterKey, urlOf) {
  return POSTER_SIZES.map((size) => ({
    width: size.width,
    url: urlOf(posterFileKey(posterKey, size)),
  }));
}

export const base64Length = (bytes) => Math.ceil(bytes / 3) * 4;
