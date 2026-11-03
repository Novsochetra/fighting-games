import { describe, expect, it } from 'vitest';

import { MOVES } from '../../../../src/data/moves.js';
import { chainMoves, detailOf, finisherLevel } from '../../../../src/render/duel/menu-detail.js';
import { specialOption } from '../../../../src/sim/duel/options.js';

const move = (id, extra = {}) => ({ ...specialOption(MOVES[id]), ...extra });

const match = { players: [{ name: 'Sochetra' }, { name: { en: 'Tola', km: 'តុលា' } }] };

describe('what the lit row brings with it', () => {
  it("names a duo's partner, in the menu's language", () => {
    expect(detailOf(match, move('kite-header', { tag: 'duo', partner: 1 }))).toBe('+ Tola');
    expect(detailOf(match, move('kite-header', { tag: 'duo', partner: 1 }), 'km')).toBe('+ តុលា');
    expect(detailOf(match, move('kite-header', { tag: 'duo' }))).toBe('DUO');
  });

  it("runs a chain's moves into each other, a named chain's two as well", () => {
    expect(detailOf(match, move('naga-shot', { from: 'apsara-curl' }))).toBe(
      'Apsara Curl > Naga Shot',
    );
    expect(detailOf(match, move('flying-naga'))).toBe('Hanuman Leap > Naga Shot');
    expect(chainMoves(move('storm-garuda'))).toEqual(['hanuman-leap', 'garuda-volley']);
  });

  it("gives a finisher the combo level it was built on: the sim's, the match's, its own", () => {
    expect(finisherLevel(move('mekong-current', { level: 4 }), match)).toBe(4);
    expect(finisherLevel(move('mekong-current'), { combo: { level: 3 } })).toBe(3);
    expect(finisherLevel(move('tonle-sap-tide'), match)).toBe(5);
    expect(detailOf(match, move('tidal-wave'))).toBe('x5 COMBO');
  });

  it('says nothing for a row that is only itself', () => {
    expect(detailOf(match, move('garuda-volley'))).toBeNull();
    expect(detailOf(match, undefined)).toBeNull();
  });
});
