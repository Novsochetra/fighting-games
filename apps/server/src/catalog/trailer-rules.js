import { isSecureUrl } from './secure-url.js';

// MP4 only, the one kind every phone plays; a local trailer only in assets/trailer/, the folder a
// saved game leaves out (offline/game-files.js).
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

export function catalogTrailers(entry, gamePath) {
  const fields = TRAILER_FIELDS.filter((field) => entry[field] !== undefined);

  return Object.fromEntries(
    fields.map((field) => {
      const value = entry[field];

      return [field, LOCAL_TRAILER.test(value) ? `${gamePath}${value}` : value];
    }),
  );
}
