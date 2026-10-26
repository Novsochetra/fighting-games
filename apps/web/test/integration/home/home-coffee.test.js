// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { COFFEE_NOTE_DELAY_MS, COFFEE_NOTE_MS } from '../../../src/home/use-coffee-note.ts';
import {
  bootWithRealCatalog,
  byId,
  click,
  onPage,
  runTimers,
  stopHomes,
  tick,
} from '../../support/home-harness.js';

// The coffee button floats at the bottom right like Buy Me a Coffee's own widget, with a note in
// Khmer, but opens the arcade's own sheet with both ways to give, and loads no script of theirs.
const COFFEE = 'https://buymeacoffee.com/sochetranov';

const note = () => byId('coffee-note');
const sheetIsOpen = () => byId('coffee-sheet').open;

// happy-dom lays nothing out, so a phone's boxes are given: the coffee button ends at 912 and the
// note stands 152 tall.
function layOutPhone({ actionsBottom }) {
  byId('coffee-open').getBoundingClientRect = () => ({ bottom: 912 });
  document.querySelector('.spotlight__actions').getBoundingClientRect = () => ({
    bottom: actionsBottom,
  });
  Object.defineProperty(note(), 'offsetHeight', { value: 152, configurable: true });
}

// The choices lead to other pages, which happy-dom would try to load.
const stayOnPage = (event) => event.preventDefault();

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  document.body.innerHTML = '';
  window.addEventListener('click', stayOnPage);
});

afterEach(() => {
  window.removeEventListener('click', stayOnPage);
  stopHomes();
  vi.useRealTimers();
});

describe('the coffee button', () => {
  it("replaces Buy Me a Coffee's widget script with the arcade's own button", async () => {
    const html = await readFile(path.join(WEB_ROOT, 'index.html'), 'utf8');
    expect(html).not.toMatch(/<script[^>]*buymeacoffee/);
    await bootWithRealCatalog();
    expect(byId('coffee-open').getAttribute('aria-label')).toBe('Buy me a coffee');
  });

  it('opens a sheet with both ways to give: KHQR on the supporters page, or a card', async () => {
    await bootWithRealCatalog();
    click(byId('coffee-open'));
    expect(sheetIsOpen()).toBe(true);
    expect(onPage(byId('coffee-khqr').getAttribute('href'))).toBe(onPage('supporters/#give'));
    const card = byId('coffee-bmc');
    expect(card.getAttribute('href')).toBe(COFFEE);
    expect(card.getAttribute('target')).toBe('_blank');
    expect(card.getAttribute('rel').split(' ')).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer']),
    );
  });

  it('puts the sheet away once a way to give is picked', async () => {
    await bootWithRealCatalog();
    click(byId('coffee-open'));
    click(byId('coffee-khqr'));
    expect(sheetIsOpen()).toBe(false);
    click(byId('coffee-open'));
    click(byId('coffee-bmc'));
    runTimers();
    expect(sheetIsOpen()).toBe(false);
  });
});

describe('the coffee note', () => {
  it('says thank you in Khmer a moment after the arcade opens, then steps back', async () => {
    await bootWithRealCatalog();
    expect(note().hidden).toBe(true);
    tick(COFFEE_NOTE_DELAY_MS);
    expect(note().hidden).toBe(false);
    const message = note().querySelector('[lang="km"]');
    expect(message.textContent).toMatch(/^អរគុណ/);
    tick(COFFEE_NOTE_MS);
    runTimers();
    expect(note().hidden).toBe(true);
  });

  it('sits beside the coffee button where it fits under the hero buttons', async () => {
    await bootWithRealCatalog();
    layOutPhone({ actionsBottom: 728 });
    tick(COFFEE_NOTE_DELAY_MS);
    expect(note().hidden).toBe(false);
    expect(note().dataset.spot).toBe('beside');
  });

  it('sits right above the coffee button where it would cover the hero buttons beside it', async () => {
    await bootWithRealCatalog();
    layOutPhone({ actionsBottom: 800 });
    tick(COFFEE_NOTE_DELAY_MS);
    expect(note().hidden).toBe(false);
    expect(note().dataset.spot).toBeUndefined();
  });

  it('opens the sheet when tapped, and goes away with its close button', async () => {
    await bootWithRealCatalog();
    tick(COFFEE_NOTE_DELAY_MS);
    click(byId('coffee-note-open'));
    runTimers();
    expect(sheetIsOpen()).toBe(true);
    expect(note().hidden).toBe(true);

    stopHomes();
    await bootWithRealCatalog();
    tick(COFFEE_NOTE_DELAY_MS);
    click(byId('coffee-note-close'));
    runTimers();
    expect(note().hidden).toBe(true);
    expect(sheetIsOpen()).toBe(false);
  });
});
