// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { tick } from '../../../src/sim/tick.js';
import { openPage, selected } from '../../support/menu-page.js';
import { fakeBoardApi } from '../../support/online-board.js';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

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

// a run from the title that falls on its last life, its ticket in by then
async function endRun(page, { score = 4200 } = {}) {
  page.act('hero-bokator');
  await settle();
  Object.assign(page.game, { lives: 1, score, playTime: 9000 });
  Object.assign(page.game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
  tick(page.game);
  page.menus.sync();
}

const weekRun = (name, score) => ({
  name,
  score,
  mission: 4,
  hero: 'ember',
  difficulty: 1,
  seconds: 600,
  cleared: false,
  date: '2026-10-28',
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
    typeName('SOK');
    send();
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
