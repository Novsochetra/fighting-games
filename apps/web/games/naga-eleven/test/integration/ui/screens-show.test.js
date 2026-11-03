// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { KITS } from '../../../src/art/kits.js';
import { createScreens } from '../../../src/ui/screens/index.js';
import { SCREEN_NAMES } from '../../../src/ui/screens/registry.js';
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
  savedAt,
} from '../../support/screen-fixtures.js';

const section = (name) => document.getElementById(`screen-${name}`);
const shown = () => [...document.querySelectorAll('.screen')].filter((node) => !node.hidden);
const textOf = (name, slot) => section(name).querySelector(`[data-slot="${slot}"]`).textContent;
const all = (name, selector) =>
  [...section(name).querySelectorAll(selector)].map((node) => node.textContent);

const SAMPLES = {
  title: {},
  menu: { hasSave: true, chapter: 2, level: 12 },
  chapters: sampleSummary(),
  hero: { hero: savedAt({ moves: ['power-shot', 'naga-shot'] }).hero, age: 'teen' },
  prematch: SAMPLE_PREMATCH,
  postmatch: SAMPLE_POSTMATCH,
  quickmatch: { teams: [CHREY, ROYAL, NEIGHBOR, HIGH_SCHOOL] },
  settings: {},
  pause: {},
  howto: { device: 'pad' },
};

describe('each screen on the real page', () => {
  let screens;

  beforeEach(async () => {
    await loadPageBody(document);
    screens = createScreens(document, { storage: fakeStorage() });
  });

  it('has a section for every screen, and starts with none shown', () => {
    expect(SCREEN_NAMES.every((name) => section(name))).toBe(true);
    expect(document.getElementById('screens').hidden).toBe(true);
    expect(screens.current()).toBe(null);
  });

  it.each(SCREEN_NAMES)('shows %s alone, its first button in focus', (name) => {
    screens.show(name, SAMPLES[name]);

    expect(shown().map((node) => node.id)).toEqual([`screen-${name}`]);
    expect(screens.current()).toBe(name);
    expect(section(name).contains(document.activeElement)).toBe(true);
    expect(document.getElementById('screens').dataset.screen).toBe(name);
  });

  it('hides them all again', () => {
    screens.show('pause');
    screens.hide();

    expect(document.getElementById('screens').hidden).toBe(true);
    expect(screens.current()).toBe(null);
  });

  it('offers Continue only with a save, and says where the story stands', () => {
    screens.show('menu', { hasSave: false });
    expect(section('menu').querySelector('[data-action="continue"]').hidden).toBe(true);
    expect(document.activeElement.dataset.action).toBe('new-story');

    screens.show('menu', SAMPLES.menu);
    expect(section('menu').querySelector('[data-action="continue"]').hidden).toBe(false);
    expect(textOf('menu', 'continue-note')).toBe('Chapter 2 · Lv 12');
  });

  it('lists the chapters done, the one played now and the ones still locked', () => {
    screens.show('chapters', SAMPLES.chapters);

    expect(all('chapters', '.chapter-title')).toEqual([
      'The Boy from Chrey Village',
      'Fire of Youth',
      'Asia Awakens',
      'The World Stage',
    ]);
    expect(all('chapters', '.chapter-state')).toEqual(['Done', 'Now', 'Locked', 'Locked']);
    expect(textOf('chapters', 'level')).toBe('Lv 12');
    expect(section('chapters').querySelector('.xp-meter').getAttribute('aria-valuenow')).toBe('29');
  });

  it('hides Play once the story is over', () => {
    screens.show('chapters', { ...SAMPLES.chapters, finished: true });

    expect(section('chapters').querySelector('[data-action="play-chapter"]').hidden).toBe(true);
    expect(section('chapters').querySelector('[data-slot="story-done"]').hidden).toBe(false);
  });

  it('shows Sochetra’s stats and moves, the sleeping ones as ???', () => {
    screens.show('hero', SAMPLES.hero);

    expect(all('hero', '.stat-name')).toHaveLength(7);
    expect(all('hero', '.stat-name')[0]).toBe('Speed');
    expect(all('hero', '.move-name')).toEqual([
      'Naga Shot',
      'Power Shot',
      '???',
      '???',
      '???',
      '???',
    ]);
    expect(all('hero', '.move-cost')[0]).toBe('40 spirit');
    expect(textOf('hero', 'spirit')).toMatch(/^Spirit \d+$/);
  });

  it('sets the match up: cup, round, both teams in their kits, the venue and the rival', () => {
    screens.show('prematch', SAMPLE_PREMATCH);

    expect(textOf('prematch', 'cup')).toBe('National Primary Schools Cup');
    expect(textOf('prematch', 'round')).toBe('Final');
    expect(all('prematch', '.team-short')).toEqual(['CHR', 'ROY']);
    expect(textOf('prematch', 'venue')).toBe('at City School Stadium');
    expect(textOf('prematch', 'rival-name')).toBe('Rithy');
    expect(textOf('prematch', 'rival-move')).toBe('Preah Khan Strike');
    expect(
      section('prematch').querySelector('.kit-chip').style.getPropertyValue('--kit-shirt'),
    ).toBe(KITS['chrey-school'].home.shirt[2]);
  });

  it('drops the rival when the match names none', () => {
    screens.show('prematch', { ...SAMPLE_PREMATCH, rival: null });

    expect(section('prematch').querySelector('[data-slot="rival"]').hidden).toBe(true);
  });

  it('sums the match up: score, scorers by minute, XP, a level gained and a move woken', () => {
    screens.show('postmatch', SAMPLE_POSTMATCH);

    expect(textOf('postmatch', 'outcome')).toBe('Win');
    expect(textOf('postmatch', 'score')).toBe('2 - 1');
    expect(all('postmatch', '.goal-minute')).toEqual(["12'", "31'", "38'"]);
    expect(all('postmatch', '.goal-scorer')).toEqual(['Rithy', 'Sochetra', 'Vuthy']);
    expect(all('postmatch', '.goal-move')).toEqual(['Preah Khan Strike', 'Naga Shot']);
    expect(textOf('postmatch', 'xp-gain')).toBe('+95 XP');
    expect(section('postmatch').querySelector('[data-slot="level-up"]').hidden).toBe(false);
    expect(all('postmatch', '.woken-name')).toEqual(['Naga Shot']);
    expect(all('postmatch', 'td.cell-short')).toEqual(['CHR', 'ROY', 'NEI']);
  });

  it('shows no table for a match outside a group, and says when nobody scored', () => {
    screens.show('postmatch', { ...SAMPLE_POSTMATCH, goals: [], score: [0, 0], group: null });

    expect(section('postmatch').querySelector('[data-slot="group"]').hidden).toBe(true);
    expect(all('postmatch', '.goal-list li')).toEqual(['No goals']);
    expect(textOf('postmatch', 'outcome')).toBe('Draw');
  });

  it('settles a draw by its penalties', () => {
    screens.show('postmatch', {
      ...SAMPLE_POSTMATCH,
      score: [1, 1],
      penalties: { for: 4, against: 3 },
    });

    expect(textOf('postmatch', 'outcome')).toBe('Win');
    expect(textOf('postmatch', 'penalties')).toBe('Penalties 4 - 3');
  });

  it('opens the quick match on two teams of one format, and the plain two before any', () => {
    screens.show('quickmatch', SAMPLES.quickmatch);
    expect(all('quickmatch', '.team-short')).toEqual(['CHR', 'ROY']);

    screens.show('quickmatch', { teams: [] });
    expect(all('quickmatch', '.team-short')).toEqual(['RED', 'BLU']);
  });

  it('opens How to play on the tab it is given', () => {
    screens.show('howto', SAMPLES.howto);

    expect(section('howto').querySelector('[aria-selected="true"]').dataset.device).toBe('pad');
    expect(all('howto', '.cap-pad')).toContain('Start');
  });

  it('tells how to play a long ball, aim a shot, strike first time and slide in', () => {
    screens.show('howto', { device: 'touch' });

    expect(all('howto', '.control-note')).toEqual([
      'Tap: along the ground, to the mate you point at',
      'Hold: a long ball in the air',
      'Hold to full: your pass skill',
      'No ball: switch player',
      'Hold, let go to shoot · up or down picks the corner',
      'Hold to full: your shot skill or special',
      'As the ball comes to you: strike it first time',
      'No ball near: slide in',
      'Tap twice with the ball: a dribble skill',
    ]);
  });

  it('tells how skills and combos play, beside the duels and the specials', () => {
    screens.show('howto', { device: 'keys' });

    expect(all('howto', '.help-card .panel-subtitle')).toEqual([
      'Duels',
      'Specials',
      'Skills',
      'Combos',
    ]);
    expect(all('howto', '.help-skills p')).toEqual([
      'Every player has a skill. With the spirit for it, hold SHOOT or PASS to full and let go.',
      'With the ball, tap RUN twice: a dribble skill.',
      'Blocks and saves fire by themselves.',
    ]);
    expect(all('howto', '.help-combos p')).toEqual([
      'Quick passes build a COMBO. From x3, hold SHOOT to full: a free finisher.',
      'A skill straight into a shot skill is a CHAIN.',
      'Two friends near the ball strike together: a DUO. Both pay.',
    ]);
    expect(all('howto', '.help-specials p')[0]).toBe(
      'Spirit fills from good play: passes, tackles, saves and beating a man.',
    );
  });
});
