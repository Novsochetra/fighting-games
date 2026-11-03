import { describe, expect, it } from 'vitest';
import { CUTIN_FRAMES } from '../../../../src/art/cutin-art.js';
import { BASIC_OPTIONS } from '../../../../src/data/duels.js';
import { MOVES } from '../../../../src/data/moves.js';
import { isBlownAway } from '../../../../src/render/duel/blown.js';
import { hasFinale } from '../../../../src/render/duel/finale.js';
import { createDuelShow, updateDuelShow } from '../../../../src/render/duel/index.js';
import { STAGE_TICKS } from '../../../../src/render/duel/stages.js';
import { decodePart } from '../../../../src/render/portraits/kit/decode.js';
import { LEGEND } from '../../../../src/render/portraits/legend.js';
import { moveOption } from '../../../../src/sim/combos/offers.js';
import { fakeMatch } from '../../../support/duel-fixtures.js';

const optionOf = (id) =>
  MOVES[id]
    ? moveOption(MOVES[id])
    : { ...BASIC_OPTIONS[id], move: null, cost: 0, power: 0, family: 'basic' };

function showOf({ kind = 'keeper', attack = 'naga-shot', word = 'goal' } = {}) {
  const match = fakeMatch();

  match.duel = {
    rounds: [
      {
        attacker: 4,
        defender: kind === 'keeper' ? 5 : 8,
        kind,
        picked: { attack: optionOf(attack), defend: optionOf('catch') },
        result: { word, side: 'attack' },
      },
    ],
    stage: 'done',
  };

  return createDuelShow(match, { heroAge: 'young' });
}

describe('the finale after a goal', () => {
  it('plays for a star’s special that scores', () => {
    expect(hasFinale(showOf())).toBe(true);
  });

  it('plays for no plain shot, no save and no field duel', () => {
    expect(hasFinale(showOf({ attack: 'shoot' }))).toBe(false);
    expect(hasFinale(showOf({ word: 'saved' }))).toBe(false);
    expect(hasFinale(showOf({ kind: 'field', word: 'through' }))).toBe(false);
  });

  it('comes between the clash and the word, and lasts its stage', () => {
    const show = Object.assign(showOf(), { stage: 'clash', stageTicks: 0 });
    const stages = [];

    for (let i = 0; i < STAGE_TICKS.clash + STAGE_TICKS.finale + 4; i += 1) {
      updateDuelShow(show);
      stages.push(show.stage);
    }

    expect(stages).toContain('finale');
    expect(stages.filter((stage) => stage === 'finale')).toHaveLength(STAGE_TICKS.finale);
    expect(stages.at(-1)).toBe('result');
  });
});

describe('the defenders blown away', () => {
  it('fly apart when a shot beats its man in a field duel', () => {
    expect(isBlownAway(showOf({ kind: 'field', word: 'through' }))).toBe(true);
    expect(isBlownAway(showOf({ kind: 'field', word: 'blocked' }))).toBe(false);
    expect(isBlownAway(showOf())).toBe(false);
  });
});

describe('the cut-in art', () => {
  const FIGURES = { strike: 5, keeper: 6, defenders: 6 };
  const PIECES = { ball: 6, net: 6 };
  const EFFECT_CODES = new Set(['o', 'd', 'm', 'l', 'h', 'y', 'g', 'G', 'r', 'e', 'E']);

  it('has every frame of every sheet', () => {
    const wanted = Object.entries({ ...FIGURES, ...PIECES }).flatMap(([name, count]) =>
      Array.from({ length: count }, (_, i) => `${name}-${i + 1}`),
    );

    expect(Object.keys(CUTIN_FRAMES).sort()).toEqual(wanted.sort());
  });

  it('draws its players in the portraits’ letters and its ball and net in the effects’ codes', () => {
    for (const key of Object.keys(CUTIN_FRAMES)) {
      const figure = FIGURES[key.split('-')[0]];
      const cells = decodePart(CUTIN_FRAMES[key], figure ? undefined : {}).cells.filter(Boolean);
      const known = figure ? (cell) => Boolean(LEGEND[cell]) : (cell) => EFFECT_CODES.has(cell);

      expect(cells.every(known), key).toBe(true);
    }
  });
});
