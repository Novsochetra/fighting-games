import { describe, expect, it } from 'vitest';

import { BASIC_OPTIONS } from '../../../../src/data/duels.js';
import { MOVES } from '../../../../src/data/moves.js';
import {
  familyOf,
  iconOf,
  openingCursor,
  partnerOf,
  rowFacts,
  tagOf,
} from '../../../../src/render/duel/menu-rows.js';
import { specialOption } from '../../../../src/sim/duel/options.js';

const basic = (id) => ({ ...BASIC_OPTIONS[id], move: null, cost: 0, power: 0 });

const move = (id, extra = {}) => ({ ...specialOption(MOVES[id]), ...extra });

describe("a duel menu row's facts", () => {
  it('reads the family and tag the sim gives, and works them out from the move without', () => {
    expect(familyOf(basic('shoot'))).toBe('basic');
    expect(familyOf(move('naga-shot'))).toBe('star');
    expect(familyOf(move('kouprey-kick'))).toBe('role');
    expect(familyOf(move('naga-shot', { family: 'combo' }))).toBe('combo');
    expect(tagOf(move('twin-naga'))).toBe('duo');
    expect(tagOf(move('mekong-current'))).toBe('finisher');
    expect(tagOf(move('flying-naga'))).toBe('chain');
    expect(tagOf(move('naga-shot', { from: 'apsara-curl' }))).toBe('chain');
    expect(tagOf(move('naga-shot'))).toBeNull();
    expect(tagOf(move('twin-naga', { tag: null }))).toBeNull();
  });

  it('draws a basic with its own picture, a star move, a skill and a combo each with theirs', () => {
    expect(iconOf(basic('catch'))).toEqual({ icon: 'catch', palette: 'plain' });
    expect(iconOf(basic('shoot'))).toEqual({ icon: 'shot', palette: 'plain' });
    expect(iconOf(move('garuda-volley'))).toEqual({ icon: 'special', palette: 'special' });
    expect(iconOf(move('bayon-eyes'))).toEqual({ icon: 'skill', palette: 'skill' });
    expect(iconOf(move('twin-naga', { tag: 'duo' }))).toEqual({ icon: 'duo', palette: 'combo' });
    expect(iconOf(move('naga-shot', { tag: 'chain' })).icon).toBe('chain');
    expect(iconOf(move('tidal-wave')).icon).toBe('combo');
  });

  it('tags the lift, the duo and the chain, and pays FREE for a finisher', () => {
    expect(rowFacts(move('naga-shot', { tag: 'chain', bonus: 8 }))).toMatchObject({
      tags: [{ word: 'bonus', value: 8 }, { word: 'chain' }],
      pays: 40,
    });
    expect(rowFacts(move('twin-naga', { tag: 'duo', cost: 36 }))).toMatchObject({
      tags: [{ word: 'duo' }],
      pays: 36,
    });
    expect(rowFacts(move('mekong-current'))).toMatchObject({ tags: [], pays: 'free' });
    expect(rowFacts(basic('dribble'))).toMatchObject({ tags: [], pays: null });
  });

  it("names a duo's partner on its tag, from the match's players by the sim's index", () => {
    const tola = { name: { en: 'Tola', km: 'តុលា' } };
    const match = { players: [{ name: 'Sochetra' }, tola] };
    const duo = move('kite-header', { tag: 'duo', partner: 1 });

    expect(partnerOf(match, duo)).toBe(tola);
    expect(rowFacts(duo, match).tags).toEqual([{ word: 'duo', partner: tola.name }]);
    expect(rowFacts(duo).tags).toEqual([{ word: 'duo', partner: null }]);
    expect(partnerOf(match, move('kite-header', { tag: 'duo' }))).toBeNull();
  });
});

describe('where the duel menu opens', () => {
  const attackRows = [
    basic('shoot'),
    move('power-shot'),
    move('naga-shot', { bonus: 8 }),
    move('garuda-volley'),
  ];

  it('opens an attacker on the strongest move with what lifts it counted', () => {
    expect(openingCursor(attackRows, { side: 'attack' })).toBe(2);
    expect(openingCursor([basic('dribble'), basic('pass')], { side: 'attack' })).toBe(0);
  });

  it('opens a defender on the skill that answers a special, and on the first row otherwise', () => {
    const rows = [basic('catch'), basic('punch'), move('bayon-eyes')];

    expect(openingCursor(rows, { side: 'defend', attack: move('naga-shot') })).toBe(2);
    expect(openingCursor(rows, { side: 'defend', attack: basic('shoot') })).toBe(0);
    expect(openingCursor(rows, { side: 'defend' })).toBe(0);
  });
});
