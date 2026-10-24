import { DIFFICULTIES } from '../../data/difficulty.js';
import { heroById } from '../../data/heroes.js';
import { LEADERBOARD_SIZE } from '../../data/leaderboard.js';
import { formatClock } from '../../render/hud/clock.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HEADINGS = ['#', 'Score', 'Hero', 'Reached', 'Difficulty', 'Time', 'Date'];
// a phone held upright has no room for every column; these give way first
const WIDE_ONLY = new Set(['Difficulty', 'Date']);

const EMPTY_HTML =
  '<p class="board-empty">No runs on the board yet.<br>A run lands here when it ends: ' +
  'after its last life, or when the last boss falls.</p>';

export function dayLabel(at) {
  const date = new Date(at);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function cellHtml(tag, heading, value) {
  const wide = WIDE_ONLY.has(heading) ? ' class="wide"' : '';
  return `<${tag}${wide}>${value}</${tag}>`;
}

function rowHtml(entry, rank, latest) {
  const hero = heroById(entry.hero);
  const cells = [
    rank,
    entry.score,
    `<span class="board-hero" data-hero="${hero.id}">${hero.name}</span>`,
    entry.cleared ? 'All clear' : `Mission ${entry.mission}`,
    DIFFICULTIES[entry.difficulty].name,
    formatClock(entry.time),
    dayLabel(entry.at),
  ];
  const classes = entry === latest ? 'board-row latest' : 'board-row';
  return `<tr class="${classes}">${cells.map((value, i) => cellHtml('td', HEADINGS[i], value)).join('')}</tr>`;
}

export function leaderboardHtml(board, latest) {
  if (!board.length) {
    return EMPTY_HTML;
  }
  const head = HEADINGS.map((heading) => cellHtml('th', heading, heading)).join('');
  const rows = board.map((entry, i) => rowHtml(entry, i + 1, latest)).join('');
  return (
    `<table class="board"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>` +
    `<p class="board-note">The best ${LEADERBOARD_SIZE} runs played on this device.</p>`
  );
}

// opens on the run that just ended, if it made the board, and keeps the row a gamepad or the arrow
// keys are on in view: a phone held sideways shows only half the board at once
export function createLeaderboardPanel({ list, game }) {
  return {
    build() {
      list.innerHTML = leaderboardHtml(game.leaderboard, game.lastRun);
    },
    firstSelected: () => Math.max(0, game.leaderboard.indexOf(game.lastRun)),
    focus(index) {
      list.querySelectorAll('.board-row')[index]?.scrollIntoView({ block: 'nearest' });
    },
  };
}
