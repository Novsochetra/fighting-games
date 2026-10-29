import { LEADERBOARD_SIZE } from '../../data/leaderboard.js';
import { boardTableHtml, dayLabel, heroHtml, runCells } from './board-table.js';

const HEADINGS = ['#', 'Score', 'Hero', 'Reached', 'Difficulty', 'Time', 'Date'];

const EMPTY_HTML =
  '<p class="board-empty">No runs on the board yet.<br>A run lands here when it ends: ' +
  'after its last life, or when the last boss falls.</p>';

export function leaderboardHtml(board, latest) {
  if (!board.length) {
    return EMPTY_HTML;
  }

  const rows = board.map((entry) => runCells(entry, heroHtml(entry.hero), dayLabel(entry.at)));
  const table = boardTableHtml({ headings: HEADINGS, rows, latest: board.indexOf(latest) });

  return `${table}<p class="board-note">The best ${LEADERBOARD_SIZE} runs played on this device.</p>`;
}
