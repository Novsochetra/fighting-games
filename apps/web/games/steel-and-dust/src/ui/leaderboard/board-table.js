import { DIFFICULTIES } from '../../data/difficulty.js';
import { heroById } from '../../data/heroes.js';
import { formatClock } from '../../render/hud/clock.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// a phone held upright has no room for every column; these give way first
const WIDE_ONLY = new Set(['Difficulty', 'Date']);

export function dayLabel(at) {
  const date = new Date(at);

  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// the online board dates a run by the day in Phnom Penh, as the server sends it
export function isoDayLabel(day) {
  const [, month, date] = day.split('-').map(Number);

  return `${date} ${MONTHS[month - 1]}`;
}

export function heroHtml(heroId) {
  const hero = heroById(heroId);

  return `<span class="board-hero" data-hero="${hero.id}">${hero.name}</span>`;
}

// a run's cells after its place: its score, who played it, how far it got, its difficulty, its
// time and its day
export function runCells(entry, who, day) {
  return [
    entry.score,
    who,
    entry.cleared ? 'All clear' : `Mission ${entry.mission}`,
    DIFFICULTIES[entry.difficulty].name,
    formatClock(entry.time),
    day,
  ];
}

function cellHtml(tag, heading, value) {
  const wide = WIDE_ONLY.has(heading) ? ' class="wide"' : '';

  return `<${tag}${wide}>${value}</${tag}>`;
}

function rowHtml(cells, headings, latest) {
  const classes = latest ? 'board-row latest' : 'board-row';
  const html = cells.map((value, i) => cellHtml('td', headings[i], value)).join('');

  return `<tr class="${classes}">${html}</tr>`;
}

export function boardTableHtml({ headings, rows, latest }) {
  const head = headings.map((heading) => cellHtml('th', heading, heading)).join('');
  const body = rows.map((cells, i) => rowHtml([i + 1, ...cells], headings, i === latest));

  return `<table class="board"><thead><tr>${head}</tr></thead><tbody>${body.join('')}</tbody></table>`;
}
