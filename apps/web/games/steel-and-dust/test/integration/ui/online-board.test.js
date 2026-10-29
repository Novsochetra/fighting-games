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

const field = () => document.querySelector('.post-name');

// a name typed into the field, as the browser reports each change, then the keyboard's Send
function typeName(name) {
  field().value = name;
  field().dispatchEvent(new Event('input', { bubbles: true }));
}

const send = () =>
  document
    .querySelector('.post-form')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

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

  it('takes a typed name, posts it with Send, and shows where the run placed', async () => {
    const page = openPage();
    await endRun(page);
    page.act('post');
    expect(openMenu().id).toBe('m-post');
    expect(field().value).toBe('');
    typeName('  Sok   Dara ');
    send();
    await settle();
    expect(page.boardApi.postScore).toHaveBeenCalledWith({
      name: 'Sok Dara',
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
    expect(field().readOnly).toBe(true);
    expect(page.storage.data.get('sd_name')).toBe('"Sok Dara"');
    expect(page.storage.data.get('sd_ticket')).toBe('null');
    page.key('Escape');
    expect(openMenu().id).toBe('m-over');
    expect(visibleButtons()).not.toContain('Post score online');
    expect(document.getElementById('overNote').textContent).toContain('Online #1 this week');
  });

  it('takes a name written in Khmer', async () => {
    const page = openPage();
    await endRun(page);
    page.act('post');
    typeName('សុខ ដារ៉ា');
    page.act('sendScore');
    await settle();
    expect(page.boardApi.postScore.mock.calls[0][0].name).toBe('សុខ ដារ៉ា');
  });

  it('says what is wrong with a name before sending it', async () => {
    const page = openPage();
    await endRun(page);
    page.act('post');
    page.act('sendScore');
    expect(note()).toBe('Type your name.');
    typeName('<b>Sok</b>');
    send();
    expect(note()).toMatch(/letters, numbers/);
    expect(page.boardApi.postScore).not.toHaveBeenCalled();
  });

  it('keeps the name typed when the panel draws again', async () => {
    const page = openPage();
    await endRun(page);
    page.act('post');
    typeName('Dara');
    page.menus.redraw('post');
    expect(field().value).toBe('Dara');
  });

  it('opens on the name last posted, so posting again is one press', async () => {
    const page = openPage({ storage: memoryStorage({ sd_name: '"Dara"' }) });
    await endRun(page);
    page.act('post');
    expect(field().value).toBe('Dara');
    page.act('sendScore');
    await settle();
    expect(page.boardApi.postScore.mock.calls[0][0].name).toBe('Dara');
  });

  it('puts the keyboard in the field as the panel opens from a click, so no letter moves the menu', async () => {
    const page = openPage();
    await endRun(page);
    page.ui.noteInput('mouse');
    page.act('post');
    expect(document.activeElement).toBe(field());
  });

  it('leaves the phone keyboard down until the field is tapped', async () => {
    const page = openPage();
    await endRun(page);
    page.ui.noteInput('touch');
    page.act('post');
    expect(document.activeElement).not.toBe(field());
  });

  it('puts the keyboard in the field, and goes down to Post with the arrow keys', async () => {
    const page = openPage();
    await endRun(page);
    page.key('ArrowDown');
    page.act('post');
    expect(document.activeElement).toBe(field());
    page.menus.state.selected = 0;
    page.key('ArrowDown');
    expect(selected().textContent).toBe('Post');
    expect(document.activeElement).not.toBe(field());
  });

  it('shows what the server says when it refuses, and keeps the ticket to try again', async () => {
    const api = fakeBoardApi();
    api.postScore.mockRejectedValueOnce(new BoardRefusal('Pick another name.'));
    const page = openPage({ api });
    await endRun(page);
    page.act('post');
    typeName('Sok');
    page.act('sendScore');
    await settle();
    expect(note()).toBe('Pick another name.');
    expect(visibleButtons()).toEqual(['Post']);
    expect(page.online.canPost(page.game.lastRun)).toBe(true);
  });

  it('says so when the board cannot be reached', async () => {
    const api = fakeBoardApi();
    api.postScore.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const page = openPage({ api });
    await endRun(page);
    page.act('post');
    typeName('Sok');
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
    typeName('Sok');
    page.act('sendScore');
    await settle();
    expect(page.boardApi.postScore.mock.calls[0][0].ticket).toBe('saved-ticket');
  });
});
