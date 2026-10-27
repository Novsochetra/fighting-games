// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { CLEAR_TICKS } from '../../../src/sim/stage/stage-clear.js';
import { tick } from '../../../src/sim/tick.js';
import { openMenu, openPage, selected } from '../../support/menu-page.js';

const SAVED = {
  mission: 4,
  score: 6200,
  coins: 57,
  playTime: 14400,
  continues: 1,
  lives: 3,
  ultMeter: 40,
};

const visibleButtons = () =>
  [...openMenu().querySelectorAll('.mbtn')]
    .filter((button) => !button.hidden)
    .map((button) => button.textContent.trim());

const boardRun = (score) => ({
  score,
  mission: 6,
  hero: 'ember',
  difficulty: 1,
  time: 20000,
  cleared: false,
  at: 1792800000000,
});

function fall(game) {
  Object.assign(game.player, { hp: 0, state: 'ko', stateTime: 80, airborne: false });
  tick(game);
}

// the saved run is continued as the Moss Shade and played until its last life goes
function loseSavedRun(page) {
  page.act('continueSaved');
  page.act('hero-moss');
  fall(page.game);
  page.menus.sync();
}

describe('a run saved on an earlier visit', () => {
  it('is offered first on the title, with a new game under it', () => {
    openPage({ checkpoint: SAVED });
    expect(visibleButtons().slice(0, 3)).toEqual(['Continue mission 5', 'New game', 'Leaderboard']);
    expect(document.querySelectorAll('#m-title .mbtn.primary:not([hidden])')).toHaveLength(1);
  });

  it('picks up at the start of its mission with what it carried there', () => {
    const page = openPage({ checkpoint: SAVED });
    page.key('Enter');
    expect(openMenu().id).toBe('m-heroes');
    page.key('Enter');
    expect(page.game).toMatchObject({
      mode: 'play',
      missionIndex: 4,
      score: 6200,
      coins: 57,
      playTime: 14400,
      continues: 1,
      lives: 3,
      ultMeter: 40,
    });
    expect(page.game.banner).toMatchObject({ text: 'Mission 5' });
    expect(page.saveRun).toHaveBeenLastCalledWith(SAVED);
  });

  it('stays saved until a new game starts in its place', () => {
    const page = openPage({ checkpoint: SAVED });
    page.act('play');
    page.key('Escape');
    expect(visibleButtons()[0]).toBe('Continue mission 5');
    page.act('play');
    page.act('hero-moss');
    expect(page.game).toMatchObject({ mode: 'play', missionIndex: 0, score: 0, lives: 5 });
    expect(page.game.checkpoint).toMatchObject({ mission: 0, score: 0, lives: 5 });
  });

  it('is let go with the last life, and the title offers only a new game', () => {
    const page = openPage({ checkpoint: { ...SAVED, lives: 1 } });
    loseSavedRun(page);
    expect(page.game.checkpoint).toBeNull();
    expect(page.saveRun).toHaveBeenLastCalledWith(null);
    expect(visibleButtons()).toEqual(['Start from mission 1', 'Leaderboard', 'Quit to title']);
    page.act('quit');
    page.menus.sync();
    expect(visibleButtons().slice(0, 2)).toEqual(['Play', 'Leaderboard']);
  });
});

describe('the leaderboard', () => {
  it('opens from the title, says how runs get on it, and goes back', () => {
    const page = openPage();
    page.act('leaderboard');
    expect(openMenu().id).toBe('m-leaderboard');
    expect(document.getElementById('leaderboardList').textContent).toContain(
      'No runs on the board',
    );
    page.key('Escape');
    expect(openMenu().id).toBe('m-title');
  });

  it('places a run that ends, and steps through the runs with the arrow keys', () => {
    const page = openPage({
      checkpoint: { ...SAVED, lives: 1 },
      leaderboard: [boardRun(9000), boardRun(4000)],
    });
    loseSavedRun(page);
    expect(document.getElementById('overNote').textContent).toContain('Leaderboard #2');
    expect(page.saveLeaderboard).toHaveBeenLastCalledWith(page.game.leaderboard);
    page.act('leaderboard');
    const rows = [...document.querySelectorAll('.board-row')];
    const scores = rows.map((row) => row.querySelectorAll('td')[1].textContent);
    expect(scores).toEqual(['9000', '6200', '4000']);
    expect(rows[1].classList.contains('latest')).toBe(true);
    page.key('ArrowDown');
    expect(selected()).toBe(rows[2]);
    page.key('ArrowDown');
    expect(selected().dataset.act).toBe('back');
    page.key('Enter');
    expect(openMenu().id).toBe('m-over');
  });

  it('places a run that clears the last mission', () => {
    const page = openPage({ checkpoint: { ...SAVED, mission: 11 } });
    page.act('continueSaved');
    page.act('hero-moss');
    page.game.clearTime = CLEAR_TICKS;
    tick(page.game);
    page.menus.sync();
    expect(openMenu().id).toBe('m-credits');
    page.key('Escape');
    expect(openMenu().id).toBe('m-clear');
    expect(page.game.checkpoint).toBeNull();
    expect(page.game.leaderboard[0]).toMatchObject({ score: 6200, mission: 12, cleared: true });
    expect(document.getElementById('clearStats').textContent).toContain('Leaderboard#1');
    page.act('leaderboard');
    expect(document.querySelector('.board-row.latest').textContent).toContain('All clear');
  });
});
