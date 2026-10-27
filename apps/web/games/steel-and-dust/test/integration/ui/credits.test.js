// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openMenu, openPage } from '../../support/menu-page.js';

const gift = (name, amount) => ({ name, amount, date: '2026-10-20', message: '' });

const roll = () => document.querySelector('#m-credits .credits-roll');
const rollTexts = (selector) =>
  [...roll().querySelectorAll(selector)].map((line) => line.textContent);

// the supporters come in once the game is up, then the last mission is cleared
async function clearTheGame(page, answer) {
  vi.stubGlobal('fetch', vi.fn(answer));
  await page.supporters.load();
  page.act('hero-angkor');
  page.game.mode = 'clear';
  page.menus.sync();
}

const supportersAnswer = (supporters) => async () => ({
  ok: true,
  json: async () => ({ supporters }),
});

function endRoll() {
  roll()
    .querySelector('.credits-finale')
    .dispatchEvent(new Event('animationend', { bubbles: true }));
}

describe('the credits once the last mission is clear', () => {
  let page;

  beforeEach(() => {
    page = openPage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('roll over the clear menu, naming the Shade who won and every supporter', async () => {
    await clearTheGame(
      page,
      supportersAnswer([gift('Dara', 5), gift('Sok Chan', 25), gift('', 1)]),
    );

    expect(page.menus.state.stack).toEqual(['clear', 'credits']);
    expect(openMenu().id).toBe('m-credits');
    expect(fetch).toHaveBeenCalledWith('../../api/supporters');
    expect(rollTexts('.credits-hero')).toEqual(['Angkor Warrior']);
    expect(rollTexts('.credits-name')).toEqual(['Nov Sochetra', 'Sok Chan', 'Dara']);
    expect(rollTexts('.credits-note')).toContain('and 1 anonymous supporter');
    expect(roll().classList.contains('rolling')).toBe(true);
    expect(roll().style.getPropertyValue('--duration-roll')).toMatch(/^[\d.]+s$/);
  });

  it('write a name as its supporter typed it, never as markup', async () => {
    await clearTheGame(page, supportersAnswer([gift('<img src=x onerror=alert(1)>', 5)]));

    expect(rollTexts('.credits-name')).toContain('<img src=x onerror=alert(1)>');
    expect(roll().querySelector('img')).toBeNull();
  });

  it('thank everyone when the supporters could not be read', async () => {
    await clearTheGame(page, async () => Promise.reject(new TypeError('offline')));

    expect(rollTexts('.credits-name')).toEqual(['Nov Sochetra']);
    expect(rollTexts('.credits-note')).toContain('Thank you to everyone who keeps the arcade free');
  });

  it('give way to the clear menu once the thanks have held', async () => {
    await clearTheGame(page, supportersAnswer([]));
    endRoll();

    expect(page.menus.state.stack).toEqual(['clear']);
    expect(openMenu().id).toBe('m-clear');
    expect(document.getElementById('clearStats').textContent).toContain('Missions');
  });

  it('skip to the clear menu with Escape, or Enter on Skip', async () => {
    await clearTheGame(page, supportersAnswer([]));
    page.key('Escape');

    expect(openMenu().id).toBe('m-clear');

    page.act('credits');
    page.key('Enter');

    expect(openMenu().id).toBe('m-clear');
  });

  it('roll again from the clear menu, and one ending under the leaderboard leaves it open', async () => {
    await clearTheGame(page, supportersAnswer([gift('Dara', 5)]));
    page.key('Escape');
    page.act('credits');

    expect(openMenu().id).toBe('m-credits');
    expect(rollTexts('.credits-name')).toContain('Dara');

    page.key('Escape');
    page.act('leaderboard');
    endRoll();

    expect(page.menus.state.stack).toEqual(['clear', 'leaderboard']);
  });
});
