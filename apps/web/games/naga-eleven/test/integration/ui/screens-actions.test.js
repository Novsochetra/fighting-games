// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { loadPageBody } from '../../support/page-body.js';
import {
  CHREY,
  fakeStorage,
  HIGH_SCHOOL,
  NEIGHBOR,
  ROYAL,
  SAMPLE_POSTMATCH,
  SAMPLE_PREMATCH,
  sampleSummary,
} from '../../support/screen-fixtures.js';

const press = (name, action) =>
  document.querySelector(`#screen-${name} [data-action="${action}"]`).click();

const MENU_ACTIONS = ['continue', 'quick-match', 'hero', 'settings', 'how-to', 'arcade'];

describe('what the screens tell the game', () => {
  let heard;
  let screens;

  beforeEach(async () => {
    await loadPageBody(document);
    heard = [];
    screens = createScreens(document, {
      storage: fakeStorage(),
      onAction: (name, payload) => heard.push([name, payload]),
    });
  });

  it('starts from the title', () => {
    screens.show('title');
    screens.confirm();

    expect(heard).toEqual([['start', undefined]]);
  });

  it.each(MENU_ACTIONS)('names the main menu’s %s', (action) => {
    screens.show('menu', { hasSave: true, chapter: 1, level: 1 });
    press('menu', action);

    expect(heard).toEqual([[action, undefined]]);
  });

  it('starts a new story at once when there is no save to lose', () => {
    screens.show('menu', { hasSave: false });
    press('menu', 'new-story');

    expect(heard).toEqual([['new-story', undefined]]);
  });

  it('asks before a new story overwrites a save, Cancel in focus', () => {
    screens.show('menu', { hasSave: true, chapter: 2, level: 9 });
    press('menu', 'new-story');

    const panel = document.querySelector('#screen-menu .confirm');

    expect(panel.hidden).toBe(false);
    expect(panel.querySelector('[data-slot="ask"]').textContent).toMatch(/new story/i);
    expect(document.activeElement.dataset.action).toBe('confirm-no');
    expect(heard).toEqual([]);

    screens.confirm();
    expect(panel.hidden).toBe(true);
    expect(document.activeElement.dataset.action).toBe('new-story');

    press('menu', 'new-story');
    screens.navigate('left');
    screens.confirm();
    expect(heard).toEqual([['new-story', undefined]]);
  });

  it('closes the question with Back, and asks nothing more', () => {
    screens.show('pause');
    press('pause', 'quit');
    screens.back();

    expect(document.querySelector('#screen-pause .confirm').hidden).toBe(true);
    expect(heard).toEqual([]);
  });

  it('quits and leaves for the arcade from the pause only once confirmed', () => {
    screens.show('pause');
    press('pause', 'quit');
    press('pause', 'confirm-yes');
    press('pause', 'arcade');
    press('pause', 'confirm-yes');

    expect(heard).toEqual([
      ['quit', undefined],
      ['arcade', undefined],
    ]);
  });

  it('resumes from the pause with its button or Back', () => {
    screens.show('pause');
    press('pause', 'resume');
    screens.back();

    expect(heard).toEqual([
      ['resume', undefined],
      ['resume', undefined],
    ]);
  });

  it('plays on with the chapter the story is in', () => {
    screens.show('chapters', sampleSummary());
    press('chapters', 'play-chapter');

    expect(heard).toEqual([['play-chapter', { chapter: 'chapter-2', number: 2 }]]);
  });

  it('kicks off, and goes on after the match', () => {
    screens.show('prematch', SAMPLE_PREMATCH);
    press('prematch', 'kick-off');
    screens.show('postmatch', SAMPLE_POSTMATCH);
    screens.back();
    press('postmatch', 'after-match');

    expect(heard).toEqual([
      ['kick-off', undefined],
      ['after-match', undefined],
    ]);
  });

  it('says where Back was pressed when a screen has nowhere of its own to go', () => {
    screens.show('chapters', sampleSummary());
    press('chapters', 'back');
    screens.show('prematch', SAMPLE_PREMATCH);
    screens.back();

    expect(heard).toEqual([
      ['back', { from: 'chapters' }],
      ['back', { from: 'prematch' }],
    ]);
  });

  it('picks the quick match’s teams with the arrows and names them at kick off', () => {
    screens.show('quickmatch', { teams: [CHREY, ROYAL, NEIGHBOR, HIGH_SCHOOL] });
    screens.navigate('right');
    screens.navigate('down');
    screens.navigate('right');
    press('quickmatch', 'pick-teams');

    const [[name, payload]] = heard;

    expect(name).toBe('pick-teams');
    expect(payload).toMatchObject({ home: 'royal-kids', away: 'neighbor-village' });
    expect(payload.teams.map((team) => team.id)).toEqual(['royal-kids', 'neighbor-village']);
  });

  it('steps a quick match team with the row’s own arrow buttons', () => {
    screens.show('quickmatch', { teams: [CHREY, ROYAL, NEIGHBOR] });
    document.querySelector('#screen-quickmatch [data-adjust="away"] .step-on').click();
    press('quickmatch', 'pick-teams');

    expect(heard[0][1]).toMatchObject({ home: 'chrey-school', away: 'neighbor-village' });
  });

  it('opens a side screen over another and returns to the button that opened it', () => {
    screens.show('pause');
    screens.navigate('down');
    screens.navigate('down');
    screens.show('settings');
    press('settings', 'back');

    expect(screens.current()).toBe('pause');
    expect(document.activeElement.dataset.action).toBe('settings');
    expect(heard).toEqual([['closed', { screen: 'settings', to: 'pause' }]]);
  });

  it('switches the help’s tabs with a tap or left and right', () => {
    screens.show('howto', { device: 'keys' });
    document.querySelector('#screen-howto [data-device="touch"]').click();

    const picked = () =>
      document.querySelector('#screen-howto [aria-selected="true"]').dataset.device;

    expect(picked()).toBe('touch');
    screens.navigate('right');
    expect(picked()).toBe('keys');
    expect(document.querySelector('#screen-howto .cap').textContent).toBe('W');
  });
});
