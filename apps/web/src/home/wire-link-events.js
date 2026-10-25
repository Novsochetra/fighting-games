import { EVENTS } from './analytics-events.js';

// Four links lead to the supporters page, and two open the coffee sheet, so each says where it sits:
// the numbers then show which one brings people to give.
const LINKS = [
  { selector: '#supporters-link', name: EVENTS.supporters, params: { placement: 'top_bar' } },
  { selector: '.support-callout__link', name: EVENTS.supporters, params: { placement: 'library' } },
  { selector: '#support-give', name: EVENTS.supporters, params: { placement: 'banner' } },
  { selector: '#coffee-khqr', name: EVENTS.supporters, params: { placement: 'coffee_sheet' } },
  { selector: '#coffee-open', name: EVENTS.coffee, params: { placement: 'button' } },
  { selector: '#coffee-note-open', name: EVENTS.coffee, params: { placement: 'note' } },
  { selector: '#coffee-bmc', name: EVENTS.buyMeACoffee, params: {} },
  { selector: '#credits-link', name: EVENTS.credits, params: {} },
];

export function wireLinkEvents({ document, track, signal }) {
  LINKS.forEach(({ selector, name, params }) => {
    const link = document.querySelector(selector);
    link?.addEventListener('click', () => track(name, params), { signal });
  });
}
