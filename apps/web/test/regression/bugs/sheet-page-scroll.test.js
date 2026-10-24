// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  bootWithRealCatalog,
  byId,
  click,
  loadHomeMarkup,
  stopHomes,
} from '../../support/home-harness.js';

// Bug: with the details sheet up on an iPhone, a finger dragging on the dimmed page scrolled the
// arcade behind the sheet, and the sheet opened with a focus ring around its close button. The page
// is held still while the sheet is up, like under an iOS sheet, and the sheet itself takes the focus.
const isHeld = () => document.documentElement.classList.contains('has-open-sheet');

beforeEach(async () => {
  document.body.innerHTML = '';
  document.documentElement.classList.remove('has-open-sheet');
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('the page behind the details sheet', () => {
  it('holds still while the sheet is up and scrolls again once it is gone', async () => {
    await bootWithRealCatalog();
    expect(isHeld()).toBe(false);
    click(byId('details-open'));
    expect(isHeld()).toBe(true);
    click(byId('details-close'));
    expect(isHeld()).toBe(false);

    click(byId('details-open'));
    byId('details').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(isHeld()).toBe(false);

    click(byId('details-open'));
    click(byId('details-play'));
    expect(isHeld()).toBe(false);
  });

  it('lets go of the page however the sheet closes', async () => {
    await bootWithRealCatalog();
    click(byId('details-open'));
    byId('details').close();
    expect(isHeld()).toBe(false);
  });

  it('gives the focus to the sheet, not to its close button', async () => {
    await bootWithRealCatalog();
    click(byId('details-open'));
    expect(document.activeElement).toBe(byId('details'));
  });
});
