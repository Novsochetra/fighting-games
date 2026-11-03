import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { drawIntro } from '../../../../src/render/cinematics/intro/draw-intro.js';
import {
  createIntro,
  isIntroDone,
  updateIntro,
} from '../../../../src/render/cinematics/intro/timeline.js';
import { setPortraitCanvasFactory } from '../../../../src/render/portraits/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { alphaAt, coloursOf, numbersOf, recorder, strays } from './view-checks.js';

const MATCHES = {
  'ch1 final': {
    home: TEAMS['chrey-school'],
    away: TEAMS['royal-kids'],
    cup: { en: 'National Primary Schools Cup', km: 'ពានរង្វាន់សាលាបឋមសិក្សាជាតិ' },
    round: { en: 'Final', km: 'វគ្គផ្ដាច់ព្រ័ត្រ' },
    venueName: 'City School Stadium',
    rival: { character: 'rithy', age: 'child' },
  },
  'ch3 group': {
    home: TEAMS['cambodia-youth'],
    away: TEAMS['japan-youth'],
    cup: { name: { en: 'Asian Youth Championship', km: 'ជើងឯកយុវជនអាស៊ី' } },
    round: { en: 'Group, match 1', km: 'វគ្គចែកពូល ប្រកួតទី១' },
    venueName: 'Asia Stadium',
    rival: 'haruto',
  },
  friendly: {
    home: TEAMS['chrey-school'],
    away: TEAMS['neighbor-village'],
    cup: 'Friendly',
    round: '',
    venueName: 'Village Field',
    rival: null,
  },
};

// where everything has slid in and holds still
const restingTick = (state) => (state.beats.rival ?? state.beats.teams) + 40;

function drawnAt(options, tick, lang = 'en') {
  const state = createIntro({ ...options, lang });
  const { context, calls } = recorder();

  while (state.tick < tick && !isIntroDone(state)) {
    updateIntro(state);
  }

  drawIntro(context, state, { tick });

  return { state, calls };
}

beforeAll(() => setPortraitCanvasFactory(createPixelCanvas));

afterAll(() => setPortraitCanvasFactory(null));

describe.each(Object.keys(MATCHES))('the intro of the %s', (name) => {
  const options = MATCHES[name];

  it.each(['en', 'km'])('draws every tick with no NaN, in %s', (lang) => {
    const state = createIntro({ ...options, lang });

    while (!isIntroDone(state)) {
      const { context, calls } = recorder();

      drawIntro(context, state, { tick: state.tick });
      expect(numbersOf(calls).every(Number.isFinite)).toBe(true);
      expect(strays(calls, 1000)).toEqual([]);
      updateIntro(state);
    }
  });

  it('holds still inside the view once everything has slid in', () => {
    const { state, calls } = drawnAt(options, 0);
    const resting = drawnAt(options, restingTick(state));

    expect(calls.length).toBeGreaterThan(0);
    expect(strays(resting.calls, 32)).toEqual([]);
  });

  it('draws nothing once it is over', () => {
    const { calls } = drawnAt(options, 10000);

    expect(calls.filter((call) => call.name === 'fillRect')).toEqual([]);
  });
});

describe('the intro over the venue', () => {
  const options = MATCHES['ch3 group'];
  const state = createIntro(options);

  while (state.tick < restingTick(state)) {
    updateIntro(state);
  }

  it('wears both kits and shows the venue through where nothing is drawn', () => {
    const canvas = createPixelCanvas(768, 432);
    const colours = coloursOf(canvas);

    drawIntro(canvas.getContext('2d'), state, { tick: 0 });

    const drawn = coloursOf(canvas);

    expect(colours.size).toBe(0);
    expect(state.kits.every((kit) => kit.shirt.some((shade) => drawn.has(shade)))).toBe(true);
    expect(alphaAt(canvas, 384, 110)).toBeLessThan(128);
    expect(alphaAt(canvas, 384, 30)).toBe(255);
  });

  it('shows the rival’s face on their card', () => {
    const canvas = createPixelCanvas(768, 432);

    drawIntro(canvas.getContext('2d'), state, { tick: 0 });

    const card = createPixelCanvas(120, 120);

    card.getContext('2d').drawImage(canvas, 620, 250, 120, 120, 0, 0, 120, 120);
    expect(coloursOf(card).size).toBeGreaterThan(12);
  });
});
