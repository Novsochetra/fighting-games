// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  bootWithRealCatalog,
  byId,
  click,
  loadHomeMarkup,
  press,
  stopHomes,
} from '../../support/home-harness.js';

const dialog = () => byId('details');

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('the details sheet', () => {
  it('opens on Details with the whole description, the controls and a Play link', async () => {
    await bootWithRealCatalog();
    click(byId('details-open'));
    expect(dialog().open).toBe(true);
    expect(byId('details-title').textContent).toBe('Steel & Dust');
    expect(byId('details-description').textContent).toMatch(/^A side-scrolling .* mission\.$/);
    const chips = [...byId('details-controls').children].map((chip) => chip.textContent);
    expect(chips).toEqual(['Keyboard', 'Gamepad', 'Touch']);
    expect(byId('details-art').getAttribute('src')).toBe(
      'games/steel-and-dust/assets/ui/select/bg-landscape.png',
    );
    expect(byId('details-play').getAttribute('href')).toBe('games/steel-and-dust/');
  });

  it('closes with its button, with Escape and with a click on the dimmed page', async () => {
    await bootWithRealCatalog();
    click(byId('details-open'));
    click(byId('details-close'));
    expect(dialog().open).toBe(false);

    click(byId('details-open'));
    dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(dialog().open).toBe(false);

    click(byId('details-open'));
    click(dialog(), { clientX: -10, clientY: -10 });
    expect(dialog().open).toBe(false);
  });

  it('holds the carousel still while it is open', async () => {
    const { navigate } = await bootWithRealCatalog();
    click(byId('details-open'));
    expect(press('ArrowRight').defaultPrevented).toBe(false);
    expect(press('Enter').defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('closes and opens the game from its Play link', async () => {
    const { navigate } = await bootWithRealCatalog();
    click(byId('details-open'));
    expect(click(byId('details-play')).defaultPrevented).toBe(true);
    expect(dialog().open).toBe(false);
    expect(navigate).toHaveBeenCalledWith('games/steel-and-dust/');
  });
});
