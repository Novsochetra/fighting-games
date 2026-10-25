import { EVENTS } from './analytics-events.js';

// Three links lead to the supporters page, so each says where it sits: the numbers then show which
// one brings people to give.
const LINKS = [
  { selector: '#supporters-link', name: EVENTS.supporters, params: { placement: 'top_bar' } },
  { selector: '.support-callout__link', name: EVENTS.supporters, params: { placement: 'library' } },
  { selector: '#support-give', name: EVENTS.supporters, params: { placement: 'banner' } },
  { selector: '#credits-link', name: EVENTS.credits, params: {} },
];

export function wireLinkEvents({ document, track, signal }) {
  LINKS.forEach(({ selector, name, params }) => {
    const link = document.querySelector(selector);
    link?.addEventListener('click', () => track(name, params), { signal });
  });
}
