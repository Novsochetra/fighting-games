import { initialsOf, paletteOf } from '@/components/avatar/avatar.js';
import { formatClock, formatCount, formatDay } from '@/utils/format.js';

const MEDALS = ['gold', 'silver', 'bronze'];
export const PODIUM_SIZE = 3;

// the poster at its smallest for the board, and every size for the browser to load the smallest
// one sharp where it shows it whole
function presentPoster(poster) {
  if (!poster) {
    return null;
  }

  const bySize = [...poster.images].sort((left, right) => left.width - right.width);

  return {
    previewSrc: bySize[0].url,
    srcSet: bySize.map((image) => `${image.url} ${image.width}w`).join(', '),
  };
}

// A run as the board shows it: its place and medal, who played it and as whom, the score, how far
// it got on which difficulty, its time and its day, its poster and its avatar (the hero cut out of
// the poster, or the player's initials). A hero or difficulty the catalog does not name shows nothing
// rather than an id.
function presentRun(run, place, { board, locale }) {
  return {
    key: `${place}:${run.name}:${run.score}`,
    place,
    medal: MEDALS[place - 1] ?? '',
    name: run.name,
    heroName: board.heroes[run.hero] ?? '',
    scoreLabel: formatCount(run.score, locale),
    reachedLabel: run.cleared ? 'All clear' : `Mission ${run.mission}`,
    difficultyName: board.difficulties[run.difficulty] ?? '',
    timeLabel: formatClock(run.seconds),
    dateLabel: formatDay(run.date, locale, { withYear: false }),
    poster: presentPoster(run.poster),
    avatarSrc: run.poster?.avatar ?? null,
    initials: initialsOf(run.name),
    palette: paletteOf({ name: run.name, isAnonymous: false }),
  };
}

export function boardView(runs, { board, locale }) {
  const rows = runs.map((run, i) => presentRun(run, i + 1, { board, locale }));

  return { isEmpty: rows.length === 0, podium: rows.slice(0, PODIUM_SIZE), rows };
}

// a game's board for a period: this week's from Monday, or every run's
export const runsOf = (data, period) => (period === 'week' ? data.week : data.allTime);
