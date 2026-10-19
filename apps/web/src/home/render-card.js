import { escapeHtml } from './escape-html.js';

function renderCover(coverSrc) {
  if (coverSrc === '') {
    return '<div class="cart__cover cart__cover--blank" aria-hidden="true"></div>';
  }
  return `<img class="cart__cover" src="${escapeHtml(coverSrc)}" alt="" decoding="async" />`;
}

function renderFacts({ genre, players }) {
  const facts = [
    ['Genre', genre],
    ['Players', players],
  ].filter(([, value]) => value !== '');
  if (facts.length === 0) {
    return '';
  }
  const rows = facts.map(
    ([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`,
  );
  return `<dl class="cart__facts">${rows.join('')}</dl>`;
}

function renderControls(controls) {
  if (controls.length === 0) {
    return '';
  }
  const badges = controls.map((control) => `<li class="badge">${escapeHtml(control)}</li>`);
  return `<ul class="cart__controls" aria-label="Controls">${badges.join('')}</ul>`;
}

export function renderGameCard(card, index) {
  return `<li class="slot">
  <a class="cart" href="${escapeHtml(card.href)}" data-game-index="${escapeHtml(index)}" tabindex="-1">
    <span class="cart__grip" aria-hidden="true"></span>
    <div class="cart__label">
      ${renderCover(card.coverSrc)}
      <h3 class="cart__title">${escapeHtml(card.title)}</h3>
      <p class="cart__tagline">${escapeHtml(card.tagline)}</p>
    </div>
    <div class="cart__details">${renderFacts(card)}${renderControls(card.controls)}</div>
  </a>
</li>`;
}

export function renderEmptySlot() {
  return `<li class="slot slot--empty">
  <div class="cart cart--empty">
    <span class="cart__grip" aria-hidden="true"></span>
    <div class="cart__label">
      <div class="cart__cover cart__cover--blank" aria-hidden="true"></div>
      <p class="cart__title">Coming soon</p>
      <p class="cart__tagline">Empty slot</p>
    </div>
  </div>
</li>`;
}

export function renderShelf({ cards, emptySlotCount }) {
  const gameSlots = cards.map((card, index) => renderGameCard(card, index));
  const emptySlots = Array.from({ length: emptySlotCount }, () => renderEmptySlot());
  return [...gameSlots, ...emptySlots].join('\n');
}
