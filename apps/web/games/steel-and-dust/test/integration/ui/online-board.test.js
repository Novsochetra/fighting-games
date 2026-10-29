// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { BoardRefusal } from '../../../src/online/board-api.js';
import { tick } from '../../../src/sim/tick.js';
import { openMenu, openPage, selected } from '../../support/menu-page.js';
import { memoryStorage } from '../../support/memory-storage.js';
import { fakeBoardApi } from '../../support/online-board.js';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

const visibleButtons = () =>
  [...openMenu().querySelectorAll('.mbtn')]
    .filter((button) => !button.hidden)
    .map((button) => button.textContent.trim());

const letters = () =>
  [...document.querySelectorAll('.initial-letter')].map((letter) => letter.textContent).join('');

const note = () => document.querySelector('.post-note').textContent;

// a run from the title that falls on its last life, its ticket in by then
async function endRun(page, { score = 4200 } = {}) {
  page.act('hero-bokator');
  await settle();
  Object.assign(page.game, { lives: 1, score, playTime: 9000 });
  Object.assign(page.game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
  tick(page.game);
  page.menus.sync();
}

const weekRun = (initials, score) => ({
  initials,
  score,
  mission: 4,
  hero: 'ember',
  difficulty: 1,
  seconds: 600,
  cleared: false,
  date: '2026-10-28',
});

describe('posting a run to the online board', () => {
  it('asks for a ticket as a fresh run starts, and offers to post the run once it ends', async () => {
    const page = openPage();
    await endRun(page);
    expect(page.boardApi.requestTicket).toHaveBeenCalledTimes(1);
    expect(openMenu().id).toBe('m-over');
    expect(visibleButtons()).toEqual([
      'Start from mission 1',
      'Post score online',
      'Share',
      'Leaderboard',
      'Quit to title',
    ]);
  });

  it('takes three typed letters, posts them, and shows where the run placed', async () => {
    const page = openPage();
    await endRun(page);
    page.act('post');
    expect(openMenu().id).toBe('m-post');
    expect(letters()).toBe('AAA');
    ['KeyS', 'KeyO', 'KeyK'].forEach(page.key);
    expect(letters()).toBe('SOK');
    expect(selected().textContent).toBe('Post');
    page.key('Enter');
    await settle();
    expect(page.boardApi.postScore).toHaveBeenCalledWith({
      initials: 'SOK',
      score: 4200,
      mission: 1,
      hero: 'bokator',
      difficulty: 1,
      seconds: 150,
      cleared: false,
      ticket: 'ticket-1',
    });
    expect(note()).toBe('Posted! #1 this week · #4 all time');
    expect(visibleButtons()).toEqual(['See the board']);
    expect(page.storage.data.get('sd_initials')).toBe('"SOK"');
    expect(page.storage.data.get('sd_ticket')).toBe('null');
    page.key('Escape');
    expect(openMenu().id).toBe('m-over');
    expect(visibleButtons()).not.toContain('Post score online');
    expect(document.getElementById('overNote').textContent).toContain('Online #1 this week');
  });

  it('turns a letter with up and down, and steps between letters with left, right and OK', async () => {
    const page = openPage();
    await endRun(page);
    page.act('post');
    page.key('ArrowUp');
    expect(letters()).toBe('BAA');
    page.key('ArrowDown');
    page.key('ArrowDown');
    expect(letters()).toBe('ZAA');
    page.key('ArrowRight');
    page.key('ArrowUp');
    expect(letters()).toBe('ZBA');
    page.key('Enter');
    expect(selected().dataset.slot).toBe('2');
    page.key('Backspace');
    expect(selected().dataset.slot).toBe('1');
    page.key('ArrowLeft');
    page.key('ArrowLeft');
    expect(selected().dataset.slot).toBe('0');
  });

  it('turns a letter with the arrows over and under it, for touch', async () => {
    const page = openPage();
    await endRun(page);
    page.act('post');
    document.querySelector('.initial[data-slot="2"] .initial-step.up').click();
    document.querySelector('.initial[data-slot="2"] .initial-step.up').click();
    document.querySelector('.initial[data-slot="0"] .initial-step.down').click();
    expect(letters()).toBe('ZAC');
  });

  it('opens on the letters last posted', async () => {
    const page = openPage({ storage: memoryStorage({ sd_initials: '"DAR"' }) });
    await endRun(page);
    page.act('post');
    expect(letters()).toBe('DAR');
  });

  it('shows what the server says when it refuses, and keeps the ticket to try again', async () => {
    const api = fakeBoardApi();
    api.postScore.mockRejectedValueOnce(new BoardRefusal('Pick other initials.'));
    const page = openPage({ api });
    await endRun(page);
    page.act('post');
    page.act('sendScore');
    await settle();
    expect(note()).toBe('Pick other initials.');
    expect(visibleButtons()).toEqual(['Post']);
    expect(page.online.canPost(page.game.lastRun)).toBe(true);
  });

  it('says so when the board cannot be reached', async () => {
    const api = fakeBoardApi();
    api.postScore.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const page = openPage({ api });
    await endRun(page);
    page.act('post');
    page.act('sendScore');
    await settle();
    expect(note()).toMatch(/Can't reach the online board/);
  });

  it('offers no post for a run that started offline, but still a share', async () => {
    const api = fakeBoardApi();
    api.requestTicket.mockRejectedValue(new TypeError('Failed to fetch'));
    const page = openPage({ api });
    await endRun(page);
    expect(visibleButtons()).toEqual([
      'Start from mission 1',
      'Share',
      'Leaderboard',
      'Quit to title',
    ]);
  });

  it('asks for no ticket for a training run, which never reaches a board', async () => {
    const page = openPage();
    page.game.settings.training = true;
    page.act('hero-moss');
    await settle();
    expect(page.boardApi.requestTicket).not.toHaveBeenCalled();
  });

  it('posts a saved run picked up on a later visit with the ticket kept for it', async () => {
    const storage = memoryStorage({ sd_ticket: '"saved-ticket"' });
    const checkpoint = {
      mission: 2,
      score: 3000,
      coins: 0,
      playTime: 6000,
      continues: 0,
      lives: 1,
      ultMeter: 0,
    };
    const page = openPage({ storage, checkpoint });
    page.act('continueSaved');
    page.act('hero-moss');
    expect(page.boardApi.requestTicket).not.toHaveBeenCalled();
    Object.assign(page.game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
    tick(page.game);
    page.menus.sync();
    page.act('post');
    page.act('sendScore');
    await settle();
    expect(page.boardApi.postScore.mock.calls[0][0].ticket).toBe('saved-ticket');
  });
});

describe('the online leaderboard', () => {
  const board = { weekStart: '2026-10-26', week: [weekRun('SOK', 9000)], allTime: [] };

  it('opens on this week, reads the board once while it is fresh, and moves between tabs', async () => {
    const page = openPage({ api: fakeBoardApi({ board }) });
    page.act('leaderboard');
    expect(page.menus.items()[page.menus.state.selected].dataset.tab).toBe('week');
    expect(document.getElementById('leaderboardList').textContent).toContain('Loading');
    await settle();
    const row = document.querySelector('.board-row');
    expect(row.textContent).toContain('SOK');
    expect(row.textContent).toContain('Ember Shade');
    expect(row.textContent).toContain('28 Oct');
    page.key('ArrowRight');
    expect(selected().dataset.tab).toBe('all');
    expect(document.getElementById('leaderboardList').textContent).toContain('No runs posted yet');
    page.key('ArrowRight');
    expect(document.getElementById('leaderboardList').textContent).toContain(
      'No runs on the board',
    );
    page.key('Escape');
    page.act('leaderboard');
    expect(page.boardApi.loadBoard).toHaveBeenCalledTimes(1);
  });

  it('marks the run just posted on the week it placed in', async () => {
    const posted = { weekStart: '2026-10-26', week: [weekRun('SOK', 4200)], allTime: [] };
    const page = openPage({ api: fakeBoardApi({ board: posted }) });
    await endRun(page);
    page.act('post');
    ['KeyS', 'KeyO', 'KeyK', 'Enter'].forEach(page.key);
    await settle();
    page.act('leaderboard');
    await settle();
    expect(document.querySelector('.board-row.latest').textContent).toContain('SOK');
  });

  it('opens on this device for a run that ended unposted', async () => {
    const page = openPage();
    await endRun(page);
    page.act('leaderboard');
    expect(document.querySelector('[aria-selected="true"]').dataset.tab).toBe('device');
    expect(document.querySelector('.board-row.latest').textContent).toContain('4200');
  });

  it('says so when the board cannot be read, and points to the runs kept on this device', async () => {
    const api = fakeBoardApi();
    api.loadBoard.mockRejectedValue(new TypeError('Failed to fetch'));
    const page = openPage({ api });
    page.act('leaderboard');
    await settle();
    expect(document.getElementById('leaderboardList').textContent).toContain(
      "Can't reach the online board",
    );
  });
});
