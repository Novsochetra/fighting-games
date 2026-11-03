import { describe, expect, it } from 'vitest';

import { BASIC_OPTIONS } from '../../../../src/data/duels.js';
import { MOVES } from '../../../../src/data/moves.js';
import { LOOK_ART } from '../../../../src/art/duel/looks.js';
import { SPECIAL_LOOKS } from '../../../../src/audio/cues/looks.js';
import { LOOK_NAMES } from '../../../../src/render/duel/looks/index.js';
import {
  createDuelShow,
  createPenaltyShow,
  drawDuelShow,
  drawPenaltyShow,
  updatePenaltyShow,
} from '../../../../src/render/duel/index.js';
import { createShootout } from '../../../../src/sim/duel/index.js';
import { specialOption } from '../../../../src/sim/duel/options.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { fakeMatch, startMeeting } from '../../../support/duel-fixtures.js';

// a context that fails the test on any number that is not finite, drawn or set
function strictContext() {
  const canvas = createPixelCanvas(768, 432);
  const inner = canvas.getContext('2d');
  const bad = [];
  const check = (name, values) => {
    if (values.some((value) => typeof value === 'number' && !Number.isFinite(value))) {
      bad.push(name);
    }
  };
  const context = new Proxy(inner, {
    get: (target, name) =>
      typeof target[name] === 'function'
        ? (...args) => {
            check(name, args);

            return target[name](...args);
          }
        : target[name],
    set: (target, name, value) => {
      check(name, [value]);
      target[name] = value;

      return true;
    },
  });

  return { canvas, context, bad };
}

const optionOf = (id) =>
  MOVES[id] ? specialOption(MOVES[id]) : { ...BASIC_OPTIONS[id], move: null, cost: 0, power: 0 };

// a duel decided beforehand, so a show can be drawn at any stage of it
function decided({ attack, defend, kind, word, side }) {
  const match = fakeMatch({ seed: 4 });

  Object.assign(match.players[3], { star: 'rithy' });
  startMeeting(match, { at: 840 });

  const round = match.duel.rounds[0];

  Object.assign(round, { kind, defender: kind === 'keeper' ? 0 + 5 : round.defender });
  round.picked = { attack: optionOf(attack), defend: optionOf(defend) };
  round.result = { word, side };
  match.duel.stage = 'done';

  return createDuelShow(match, { heroAge: 'young' });
}

const STAGES = [
  ['intro', [12]],
  ['versus', [10]],
  ['menu', [5]],
  ['cutin', [12]],
  ['clash', [30, 54, 70]],
  ['result', [4]],
  ['outro', [12]],
];

function drawEvery(show, lang) {
  const { canvas, context, bad } = strictContext();

  for (const [stage, ticks] of STAGES) {
    for (const stageTicks of ticks) {
      Object.assign(show, {
        stage,
        stageTicks,
        ticks: 200 + stageTicks,
        cutins: ['attack', 'defend'],
        cutin: stageTicks % 2,
      });
      drawDuelShow(context, show, { lang, tick: show.ticks });
    }
  }

  return { canvas, bad };
}

const SHOT_MOVES = Object.values(MOVES)
  .filter((move) => move.kind === 'shot')
  .map((move) => move.id);
const DRIBBLE_MOVES = Object.values(MOVES)
  .filter((move) => move.kind === 'dribble')
  .map((move) => move.id);

const painted = (canvas) => canvas.data.some((value, i) => i % 4 === 3 && value > 0);

describe('drawing a duel show', () => {
  it.each(SHOT_MOVES)('draws every stage of %s against the keeper with no NaN', (move) => {
    for (const [word, side] of [
      ['goal', 'attack'],
      [move === 'power-shot' ? 'wide' : 'saved', 'defend'],
    ]) {
      const { canvas, bad } = drawEvery(
        decided({ attack: move, defend: 'catch', kind: 'keeper', word, side }),
        'en',
      );

      expect(bad).toEqual([]);
      expect(painted(canvas)).toBe(true);
    }
  });

  it.each(DRIBBLE_MOVES)('draws every stage of %s past a tackle with no NaN', (move) => {
    for (const [word, side] of [
      ['broke', 'attack'],
      ['stolen', 'defend'],
    ]) {
      expect(
        drawEvery(decided({ attack: move, defend: 'tackle', kind: 'field', word, side }), 'km').bad,
      ).toEqual([]);
    }
  });

  it.each(['angkor-wall', 'mountain-guard', 'iron-gate'])(
    'raises and breaks %s with no NaN',
    (guard) => {
      const kind = guard === 'iron-gate' ? 'field' : 'keeper';
      const attack = kind === 'field' ? 'dribble' : 'shoot';

      for (const [word, side] of kind === 'field'
        ? [
            ['broke', 'attack'],
            ['stolen', 'defend'],
          ]
        : [
            ['goal', 'attack'],
            ['saved', 'defend'],
          ]) {
        expect(drawEvery(decided({ attack, defend: guard, kind, word, side }), 'en').bad).toEqual(
          [],
        );
      }
    },
  );

  it('draws the plain options, passes, blocks and parries too', () => {
    const keeper = {
      attack: 'shoot',
      defend: 'punch',
      kind: 'keeper',
      word: 'parried',
      side: 'defend',
    };

    expect(drawEvery(decided(keeper), 'km').bad).toEqual([]);

    const plays = [
      { attack: 'pass', defend: 'intercept', word: 'passed', side: 'attack' },
      { attack: 'pass', defend: 'intercept', word: 'cut', side: 'defend' },
      { attack: 'shoot', defend: 'block', word: 'blocked', side: 'defend' },
      { attack: 'shoot', defend: 'block', word: 'through', side: 'attack' },
    ];

    for (const play of plays) {
      expect(drawEvery(decided({ ...play, kind: 'field' }), 'en').bad).toEqual([]);
    }
  });

  it('has a look for every move, its own as planned, coloured and heard', () => {
    for (const move of Object.values(MOVES)) {
      expect(LOOK_NAMES).toContain(move.look);
      expect(move.look, move.id).toBe(move.plannedLook);
    }

    for (const look of LOOK_NAMES) {
      expect(LOOK_ART[look], look).toBeDefined();
      expect(SPECIAL_LOOKS[look], look).toBeDefined();
    }
  });

  it.each([
    ['apsara-curl', 'intercept', 'field', ['passed', 'cut']],
    ['kite-cross', 'intercept', 'field', ['passed', 'cut']],
    ['shoot', 'elephant-guard', 'field', ['through', 'blocked']],
    ['shoot', 'steel-block', 'field', ['through', 'blocked']],
    ['shoot', 'bayon-eyes', 'keeper', ['goal', 'saved']],
    ['shoot', 'panther-dive', 'keeper', ['goal', 'saved']],
    ['shoot', 'belly-block', 'keeper', ['goal', 'saved']],
  ])(
    'draws the skill %s against %s, its cut-in and its look, with no NaN',
    (attack, defend, kind, words) => {
      for (const [i, word] of words.entries()) {
        const show = decided({ attack, defend, kind, word, side: i === 0 ? 'attack' : 'defend' });

        expect(drawEvery(show, i === 0 ? 'en' : 'km').bad).toEqual([]);
      }
    },
  );

  it('draws a whole shootout with no NaN', () => {
    const match = fakeMatch({ seed: 6, humanTeam: null });
    const show = createPenaltyShow(createShootout(match), { match });
    const { canvas, context, bad } = strictContext();

    for (let i = 0; i < 6000 && show.stage !== 'done'; i += 1) {
      updatePenaltyShow(show, {});

      if (i % 23 === 0) {
        drawPenaltyShow(context, show, { lang: i % 2 ? 'km' : 'en', tick: i });
      }
    }

    expect(show.stage).toBe('done');
    expect(bad).toEqual([]);
    expect(painted(canvas)).toBe(true);
  });
});
