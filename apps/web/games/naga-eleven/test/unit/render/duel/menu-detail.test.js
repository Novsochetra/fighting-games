import { describe, expect, it } from 'vitest';

import { MOVES } from '../../../../src/data/moves.js';
import {
  chainMoves,
  detailOf,
  duoShares,
  finisherLevel,
} from '../../../../src/render/duel/menu-detail.js';
import { specialOption } from '../../../../src/sim/duel/options.js';

const move = (id, extra = {}) => ({ ...specialOption(MOVES[id]), ...extra });

const match = { players: [{ name: 'Sochetra' }, { name: { en: 'Tola', km: 'តុលា' } }] };

describe('what the lit row brings with it', () => {
  it("tells what each of a duo pays, the striker's share first, in the menu's language", () => {
    const twin = move('twin-naga', { tag: 'duo', partner: 1, cost: 36, partnerShare: 24 });

    expect(detailOf(match, twin)).toBe('36 + 24');
    expect(detailOf(match, twin, 'km')).toBe('៣៦ + ២៤');
    expect(duoShares(twin)).toEqual([36, 24]);
  });

  it("leaves the duo's partner to his row's tag, so he is named once", () => {
    const kite = move('kite-header', { tag: 'duo', partner: 1, cost: 25, partnerShare: 25 });

    expect(detailOf(match, kite)).not.toMatch(/Tola|DUO/);
    expect(detailOf(match, kite, 'km')).not.toMatch(/តុលា|គូ/);
  });

  it('tells the share a partner paid with his pass, and the shares of a duo the sim names', () => {
    expect(duoShares(move('chrey-lightning', { tag: 'duo', cost: 30, partnerShare: 0 }))).toEqual([
      30, 25,
    ]);
    expect(duoShares({ move: 'made-up', tag: 'duo', cost: 20, partnerShare: 15 })).toEqual([
      20, 15,
    ]);
    expect(detailOf(match, { move: 'made-up', tag: 'duo', cost: 20 })).toBeNull();
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
