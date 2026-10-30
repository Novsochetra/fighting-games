import { heroById } from '../../data/heroes.js';
import { missionAt, MISSIONS } from '../../data/missions/index.js';

export const SHARE_TITLE = 'Steel & Dust';

const points = (score) => score.toLocaleString('en-US');

export function reachedLine(run) {
  return run.cleared
    ? `All ${MISSIONS.length} missions clear!`
    : `Mission ${run.mission}: ${missionAt(run.mission - 1).name}`;
}

export const rankLine = (rank) => (rank ? `#${rank.week} this week online` : '');

const playerLine = (name) => (name ? `by ${name}` : '');

// what goes with the card: what the run did, and a dare
export function shareText(run, rank) {
  const hero = heroById(run.hero).name;
  const what = run.cleared
    ? `I cleared all ${MISSIONS.length} missions of Steel & Dust as ${hero}`
    : `I reached mission ${run.mission} of Steel & Dust as ${hero}`;
  const place = rank ? `, #${rank.week} on this week's board` : '';

  return `${what} with ${points(run.score)} points${place}. Can you beat me?`;
}

// the words on the card, from the top; the board's copy names who played in place of a rank that
// would soon be out of date there
export function cardWords(run, rank, name) {
  return {
    hero: heroById(run.hero).name,
    score: points(run.score),
    reached: reachedLine(run),
    rank: rankLine(rank),
    player: playerLine(name),
  };
}
