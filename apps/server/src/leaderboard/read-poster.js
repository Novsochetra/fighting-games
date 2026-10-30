import { jpegSize, pngSize } from './image-size.js';
import { base64Length, POSTER_SIZES } from './poster-files.js';

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
const SIZE_OF = { 'image/png': pngSize, 'image/jpeg': jpegSize };
const NOT_A_POSTER = 'That is not a poster the game drew.';

// the server checks only that each size is the image and shape it says: what a poster shows it
// cannot check, so a poster can be taken off the board by hand (0003_score_posters)
function readImage(text, size) {
  if (typeof text !== 'string' || text.length > base64Length(size.maxBytes) || !BASE64.test(text)) {
    return null;
  }

  const bytes = Buffer.from(text, 'base64');
  const shape = SIZE_OF[size.type](bytes);

  return shape?.width === size.width && shape.height === size.height ? bytes : null;
}

export function readPoster(body, rulesByGame) {
  const { game, ticket, images } = body ?? {};

  if (!rulesByGame.has(game)) {
    return { error: 'That game has no leaderboard.' };
  }

  if (typeof ticket !== 'string') {
    return { error: 'Send the ticket the run was posted with.' };
  }

  const files = POSTER_SIZES.map((size) => ({ size, bytes: readImage(images?.[size.name], size) }));

  return files.every((file) => file.bytes) ? { game, ticket, files } : { error: NOT_A_POSTER };
}
