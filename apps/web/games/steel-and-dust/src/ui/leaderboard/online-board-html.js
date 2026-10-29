import { escapeHtml } from '../../lib/html.js';
import { boardTableHtml, heroHtml, isoDayLabel, runCells } from './board-table.js';

const HEADINGS = ['#', 'Score', 'Player', 'Reached', 'Difficulty', 'Time', 'Date'];
const RUNS_OF_TAB = { week: 'week', all: 'allTime' };
const LOADING = 'Loading the online board…';
const FAILED =
  "Can't reach the online board right now.<br>Your best runs are kept under This device.";
const EMPTY = {
  week: 'No runs posted this week yet.<br>Post yours when a run ends and lead the week!',
  all: 'No runs posted yet.<br>Post yours when a run ends and be the first!',
};
const NOTES = {
  week: 'The top runs posted this week. A new week starts on Monday.',
  all: 'The top runs ever posted to the online board.',
};

const whoHtml = (entry) =>
  `<b class="board-name">${escapeHtml(entry.name)}</b> ${heroHtml(entry.hero)}`;

// the run just posted, if it is on this board: where the server ranked it, if the run there is it
export function onlineLatest(runs, posted, tab) {
  if (!posted) {
    return -1;
  }

  const at = posted.rank[RUNS_OF_TAB[tab]] - 1;
  const entry = runs[at];

  return entry?.name === posted.name && entry.score === posted.run.score ? at : -1;
}

export const runsOfTab = (online, tab) => online.runs?.[RUNS_OF_TAB[tab]] ?? null;

export function onlineBoardHtml(online, tab) {
  const runs = runsOfTab(online, tab);

  if (!runs) {
    return `<p class="board-empty">${online.status === 'failed' ? FAILED : LOADING}</p>`;
  }

  if (!runs.length) {
    return `<p class="board-empty">${EMPTY[tab]}</p>`;
  }

  const rows = runs.map((entry) => runCells(entry, whoHtml(entry), isoDayLabel(entry.date)));
  const table = boardTableHtml({
    headings: HEADINGS,
    rows,
    latest: onlineLatest(runs, online.posted, tab),
  });

  return `${table}<p class="board-note">${NOTES[tab]}</p>`;
}
