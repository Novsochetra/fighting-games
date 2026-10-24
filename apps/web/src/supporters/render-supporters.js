import { escapeHtml } from '../home/escape-html.js';

// The rows rise in one after another, but never wait longer than this many steps.
const MAX_STAGGER = 12;

export function renderAvatar({ initials, palette }, size = '') {
  const className = size ? `avatar avatar--${size}` : 'avatar';
  return `<span class="${className}" data-palette="${Number(palette)}" aria-hidden="true">${escapeHtml(initials)}</span>`;
}

const renderMessage = (className, message) =>
  message ? `<span class="${className}">${escapeHtml(message)}</span>` : '';

const renderDay = ({ date, dateLabel }) =>
  date
    ? `<time class="roll__date" datetime="${escapeHtml(date)}">${escapeHtml(dateLabel)}</time>`
    : '';

export function renderPodiumPlace(supporter) {
  return `<li class="podium__place" data-medal="${escapeHtml(supporter.medal)}">
  <span class="podium__portrait">
    ${renderAvatar(supporter, 'large')}
    <span class="podium__medal" aria-hidden="true">${Number(supporter.rank)}</span>
  </span>
  <span class="podium__name">${escapeHtml(supporter.name)}</span>
  <span class="podium__amount">${escapeHtml(supporter.amountLabel)}</span>
  ${renderMessage('podium__message', supporter.message)}
</li>`;
}

export function renderRow(supporter, order) {
  const stagger = Math.min(Number(order), MAX_STAGGER);
  return `<li class="roll__row" data-medal="${escapeHtml(supporter.medal)}" style="--order: ${stagger}">
  <span class="roll__rank" aria-hidden="true">${Number(supporter.rank)}</span>
  ${renderAvatar(supporter)}
  <span class="roll__text">
    <span class="roll__name">${escapeHtml(supporter.name)}</span>
    ${renderMessage('roll__message', supporter.message)}
  </span>
  <span class="roll__end">
    <span class="roll__amount">${escapeHtml(supporter.amountLabel)}</span>
    ${renderDay(supporter)}
  </span>
</li>`;
}
