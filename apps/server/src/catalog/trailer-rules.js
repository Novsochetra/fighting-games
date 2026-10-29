import { isSecureUrl } from './secure-url.js';

// A game's trailer, the video of play the arcade's details sheet shows: an MP4 (the one kind every
// phone plays), either in the game's assets/trailer/, which a saved game leaves out
// (offline/game-files.js), or at an https: address of its own, such as a CDN. trailerSmall is a
// lighter copy of it, for phones and slow connections.
export const TRAILER_FIELDS = ['trailer', 'trailerSmall'];
const LOCAL_TRAILER = /^assets\/trailer\/[\w-][\w.-]*\.mp4$/;

const isHostedTrailer = (value) => isSecureUrl(value) && new URL(value).pathname.endsWith('.mp4');

export const isTrailer = (value) =>
  typeof value === 'string' && (LOCAL_TRAILER.test(value) || isHostedTrailer(value));

export function checkTrailers(entry) {
  const problems = TRAILER_FIELDS.filter(
    (field) => entry[field] !== undefined && !isTrailer(entry[field]),
  ).map(
    (field) =>
      `"${field}" must be an .mp4 in the game's assets/trailer/ folder or at an https:// address`,
  );

  if (entry.trailerSmall !== undefined && entry.trailer === undefined) {
    problems.push('"trailerSmall" needs the "trailer" it is a smaller copy of');
  }

  return problems;
}

// A trailer in the game's folder is found under it; one on its own site stays where it is.
export function catalogTrailers(entry, gamePath) {
  const fields = TRAILER_FIELDS.filter((field) => entry[field] !== undefined);

  return Object.fromEntries(
    fields.map((field) => {
      const value = entry[field];

      return [field, LOCAL_TRAILER.test(value) ? `${gamePath}${value}` : value];
    }),
  );
}
