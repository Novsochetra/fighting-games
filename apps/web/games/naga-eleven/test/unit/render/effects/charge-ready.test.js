import { describe, expect, it } from 'vitest';
import { KICK } from '../../../../src/data/tuning.js';
import { readyMoveOf } from '../../../../src/render/effects/charge-ready.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

const charged = (match, player, fields) =>
  Object.assign(match.players[player], { charge: KICK.chargeTicks, cooldown: 0, ...fields });

describe('what a full charge would fire', () => {
  it("is a star's strongest shot he can pay for, held on SHOOT", () => {
    const match = fixtureMatch();
    const star = charged(match, 9, { charging: 'shoot', moves: ['naga-shot', 'garuda-volley'] });

    star.spirit = 45;
    expect(readyMoveOf(match, star)).toBe('naga-shot');

    star.spirit = 60;
    expect(readyMoveOf(match, star)).toBe('garuda-volley');
  });

  it("is a player's own skill for the button he holds", () => {
    const match = fixtureMatch();
    const forward = charged(match, 3, { charging: 'shoot', moves: [], skill: 'kouprey-kick' });
    const wing = charged(match, 4, { charging: 'pass', moves: [], skill: 'kite-cross' });

    forward.spirit = 40;
    wing.spirit = 40;

    expect(readyMoveOf(match, forward)).toBe('kouprey-kick');
    expect(readyMoveOf(match, wing)).toBe('kite-cross');
  });

  it('is the free finisher for the holder of a combo of x3 and more', () => {
    const match = fixtureMatch();
    const holder = charged(match, 3, { charging: 'shoot', moves: [], skill: null, spirit: 0 });

    match.combo = { team: 0, level: 3, holder: 3, since: match.tick, passer: 2, before: 1 };
    expect(readyMoveOf(match, holder)).toBe('mekong-current');

    match.combo.level = 5;
    expect(readyMoveOf(match, holder)).toBe('tonle-sap-tide');
  });

  it('is nothing before the charge is full, without the spirit, or while he waits', () => {
    const match = fixtureMatch();
    const forward = charged(match, 3, { charging: 'shoot', skill: 'kouprey-kick', moves: [] });

    forward.spirit = 10;
    expect(readyMoveOf(match, forward)).toBeNull();

    forward.spirit = 99;
    forward.cooldown = 30;
    expect(readyMoveOf(match, forward)).toBeNull();

    forward.cooldown = 0;
    forward.charge = KICK.chargeTicks - 1;
    expect(readyMoveOf(match, forward)).toBeNull();
  });
});
