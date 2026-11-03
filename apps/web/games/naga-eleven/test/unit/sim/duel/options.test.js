import { describe, expect, it } from 'vitest';

import { MOVES } from '../../../../src/data/moves.js';
import { duelOptions } from '../../../../src/sim/duel/index.js';
import { fakeMatch, forwardOn, startMeeting } from '../../../support/duel-fixtures.js';

const idsOf = (options) => options.map((option) => option.id);

describe('duel options', () => {
  it('offers the attacker a dribble, a pass to a free mate and a shot in range', () => {
    const match = fakeMatch();

    Object.assign(match.players[3], { x: 760, y: 200 });
    startMeeting(match, { at: 720 });

    expect(idsOf(duelOptions(match, 'attack'))).toEqual(['dribble', 'pass', 'shoot']);
    expect(idsOf(duelOptions(match, 'defend'))).toEqual(['tackle', 'block', 'intercept']);
  });

  it('leaves the shot out far from goal, and the pass with no mate to find', () => {
    const match = fakeMatch();

    [1, 2, 3].forEach((index) => Object.assign(match.players[index], { stun: 30 }));
    startMeeting(match, { at: 300 });

    expect(idsOf(duelOptions(match, 'attack'))).toEqual(['dribble']);
  });

  it('lists each special its owner can afford, with its cost', () => {
    const match = fakeMatch();

    startMeeting(match, {
      at: 720,
      attacker: { moves: ['naga-shot', 'hanuman-leap', 'seven-headed-naga'], spirit: 50 },
    });

    const specials = duelOptions(match, 'attack').filter((option) => option.move);

    expect(idsOf(specials)).toEqual(['naga-shot', 'hanuman-leap']);
    expect(specials[0]).toMatchObject({
      kind: 'shot',
      cost: MOVES['naga-shot'].cost,
      look: 'naga',
    });
    expect(specials[0].label).toEqual(MOVES['naga-shot'].name);
  });

  it('offers Twin Naga as a duo only with Rithy near him, his share in hand', () => {
    const offered = (rithy) => {
      const match = fakeMatch();

      Object.assign(match.players[3], rithy);
      startMeeting(match, {
        at: 720,
        attacker: { moves: ['twin-naga'], spirit: 100 },
        defender: { star: 'haruto' },
      });

      return duelOptions(match, 'attack').find((option) => option.move === 'twin-naga');
    };

    expect(offered({})).toBeUndefined();
    expect(offered({ star: 'rithy', spirit: 100, x: 220 })).toBeUndefined();
    expect(offered({ star: 'rithy', spirit: 10, x: 700 })).toBeUndefined();
    expect(offered({ star: 'rithy', spirit: 100, x: 700 })).toMatchObject({
      tag: 'duo',
      partner: 3,
      cost: 36,
      partnerShare: 24,
    });
  });

  it('gives the defender their own specials, and none of the attacking ones', () => {
    const match = fakeMatch();

    startMeeting(match, {
      defender: { star: 'lukas', moves: ['iron-gate', 'carnival-rocket'], spirit: 99 },
    });

    expect(idsOf(duelOptions(match, 'defend'))).toEqual([
      'tackle',
      'block',
      'intercept',
      'iron-gate',
    ]);
  });

  it('offers nothing with no duel on', () => {
    const match = fakeMatch();

    expect(duelOptions(match, 'attack')).toEqual([]);
    expect(forwardOn(match, 0).spirit).toBe(0);
  });
});
