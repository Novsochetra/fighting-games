import { SORTS } from './ranking.js';
import { renderPodiumPlace, renderRow } from './render-supporters.js';

export const LOADING_MESSAGE = 'Loading supporters…';
export const ERROR_MESSAGE = 'The supporters did not load. Check your connection and try again.';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    notice: byId('notice'),
    status: byId('status'),
    retry: byId('retry'),
    stats: byId('stats'),
    total: byId('total'),
    count: byId('count'),
    donate: byId('donate'),
    empty: byId('empty'),
    podiumSection: byId('podium-section'),
    podium: byId('podium'),
    roll: byId('roll'),
    rollList: byId('roll-list'),
    sort: byId('sort'),
  };
}

function showSort(sort, order) {
  const segment = Math.max(0, SORTS.indexOf(order));
  sort.dataset.segment = String(segment);
  sort.style.setProperty('--segment', String(segment));
  for (const option of sort.querySelectorAll('[data-sort]')) {
    option.setAttribute('aria-pressed', String(option.dataset.sort === order));
  }
}

export function createSupportersView(document) {
  const elements = findElements(document);
  const content = [elements.stats, elements.empty, elements.podiumSection, elements.roll];

  function showNotice(tone, message) {
    elements.notice.hidden = false;
    elements.notice.dataset.tone = tone;
    elements.status.textContent = message;
    elements.retry.hidden = tone !== 'error';
    for (const element of content) {
      element.hidden = true;
    }
  }

  function renderRoll(page) {
    elements.roll.dataset.order = page.order;
    elements.rollList.innerHTML = page.rows.map(renderRow).join('\n');
    showSort(elements.sort, page.order);
  }

  function render(page) {
    elements.notice.hidden = true;
    elements.total.textContent = page.totalLabel;
    elements.count.textContent = page.countLabel;
    elements.donate.hidden = page.donateUrl === '';
    elements.donate.href = page.donateUrl || '#';
    elements.stats.hidden = page.isEmpty;
    elements.empty.hidden = !page.isEmpty;
    elements.podiumSection.hidden = page.isEmpty;
    elements.roll.hidden = page.isEmpty;
    elements.podium.innerHTML = page.podium.map(renderPodiumPlace).join('\n');
    renderRoll(page);
  }

  return {
    elements,
    showLoading: () => showNotice('loading', LOADING_MESSAGE),
    showError: () => showNotice('error', ERROR_MESSAGE),
    render,
    renderRoll,
  };
}
