import { randomBytes } from 'node:crypto';

// the run that got there first ranks above one that ties it
const byScore = (left, right) => right.score - left.score || left.id - right.id;

function posterMethods(scores) {
  return {
    async posterless(game, ticket, since) {
      const saved = scores.find(
        (each) => each.game === game && each.ticket === ticket && each.createdAt >= since,
      );

      return saved && !saved.poster ? { ...saved } : null;
    },

    async setPoster(id, posterKey) {
      const saved = scores.find((each) => each.id === id);

      if (!saved || saved.poster) {
        return false;
      }

      saved.poster = posterKey;

      return true;
    },
  };
}

export function createMemoryScoresStore({ now = () => new Date() } = {}) {
  const scores = [];
  const secret = randomBytes(32).toString('base64url');

  const top = (game, since, size) =>
    scores
      .filter((saved) => saved.game === game && saved.createdAt >= since)
      .sort(byScore)
      .slice(0, size)
      .map((saved) => ({ ...saved }));

  return {
    ...posterMethods(scores),

    async add(run, ticket) {
      if (scores.some((saved) => saved.ticket === ticket)) {
        return null;
      }

      const saved = { ...run, ticket, id: scores.length + 1, createdAt: now(), poster: null };

      scores.push(saved);

      return { ...saved };
    },

    async board(game, { weekStart, size }) {
      return { week: top(game, weekStart, size), allTime: top(game, new Date(0), size) };
    },

    async rank(run, weekStart) {
      const above = scores.filter(
        (saved) => saved.game === run.game && saved.id !== run.id && saved.score >= run.score,
      );
      const thisWeek = above.filter((saved) => saved.createdAt >= weekStart);

      return { week: thisWeek.length + 1, allTime: above.length + 1 };
    },

    async secret() {
      return secret;
    },

    async ping() {},
  };
}
