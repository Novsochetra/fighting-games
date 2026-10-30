import { newPosterKey, posterFileKey, posterImages } from './poster-files.js';
import { readPoster } from './read-poster.js';

// the game sends a run's poster as soon as its score is posted
export const POSTER_WINDOW_MS = 10 * 60 * 1000;
const NO_RUN = 'No run posted in the last ten minutes with that ticket is waiting for a poster.';

const refusal = (status, message) => ({ status, message });

// the ticket that posted the run, spent then, is what proves the poster is that run's
async function waitingRun(leaderboard, { game, ticket }) {
  const checked = (await leaderboard.tickets()).check(ticket, 0);

  if (checked.error) {
    return { refused: refusal(400, checked.error) };
  }

  const since = new Date(leaderboard.now() - POSTER_WINDOW_MS);
  const run = await leaderboard.scores.posterless(game, checked.nonce, since);

  return run ? { run } : { refused: refusal(409, NO_RUN) };
}

// the files go up before the run names them, so the board never shows a poster still on its way
export async function postPoster(leaderboard, body) {
  const { storage } = leaderboard;

  if (!storage) {
    return refusal(404, 'This arcade keeps no posters.');
  }

  const poster = readPoster(body, await leaderboard.rulesByGame());

  if (poster.error) {
    return refusal(400, poster.error);
  }

  const { run, refused } = await waitingRun(leaderboard, poster);

  if (refused) {
    return refused;
  }

  const posterKey = newPosterKey(poster.game);
  const put = ({ size, bytes }) =>
    storage.putFile({ key: posterFileKey(posterKey, size), body: bytes, contentType: size.type });

  await Promise.all(poster.files.map(put));

  if (!(await leaderboard.scores.setPoster(run.id, posterKey))) {
    return refusal(409, NO_RUN);
  }

  leaderboard.boards.forget(poster.game);

  return { status: 201, json: JSON.stringify({ poster: posterImages(posterKey, storage.urlOf) }) };
}
