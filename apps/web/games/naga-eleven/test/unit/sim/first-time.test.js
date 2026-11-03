import { describe, expect, it } from 'vitest';
import { airMeets, strikeFirstTime, wantsFirstTime } from '../../../src/sim/first-time.js';
import { looseBallAt, matchInPlay, only } from '../../support/match-driver.js';

const middleOf = (match) => match.pitch.width / 2;

function striker(match, index, gap = 120) {
  only(match, [index, 11]);

  return Object.assign(match.players[index], {
    x: match.pitch.length - gap,
    y: middleOf(match),
    noPickup: 0,
    stun: 0,
  });
}

describe('a first-time strike', () => {
  it('is what the one the player steers does once they pressed shoot for it', () => {
    const match = matchInPlay();
    const player = striker(match, 9);

    match.controlled = 9;
    expect(wantsFirstTime(match, player)).toBe(false);

    player.strike = 10;
    expect(wantsFirstTime(match, player)).toBe(true);
  });

  it('is struck by the computer near goal now and then, never from far out', () => {
    let near = 0;

    for (let seed = 1; seed <= 30; seed += 1) {
      const match = matchInPlay(seed);

      match.controlled = 1;
      near += wantsFirstTime(match, striker(match, 9)) ? 1 : 0;
      expect(wantsFirstTime(match, striker(match, 9, 700))).toBe(false);
    }

    expect(near).toBeGreaterThan(5);
    expect(near).toBeLessThan(30);
  });

  it('volleys at the waist and heads higher, the header slower', () => {
    const volley = matchInPlay();
    const header = matchInPlay();

    looseBallAt(volley, { x: volley.pitch.length - 110, y: middleOf(volley), z: 24 });
    looseBallAt(header, { x: header.pitch.length - 110, y: middleOf(header), z: 44 });
    strikeFirstTime(volley, striker(volley, 9));
    strikeFirstTime(header, striker(header, 9));

    expect(volley.ball.kick).toBe('shot');
    expect(header.ball.kick).toBe('shot');
    expect(volley.ball.vx).toBeGreaterThan(header.ball.vx);
  });
});

describe('a high ball met by the mate it was passed to', () => {
  it('is brought down, not headed on', () => {
    const match = matchInPlay();
    const player = Object.assign(match.players[6], { x: 800, y: 500, noPickup: 0, stun: 0 });

    only(match, [6, 7]);
    Object.assign(match.players[7], { x: 900, y: 500, stun: 0 });
    Object.assign(player, { receiving: 30 });
    looseBallAt(match, { x: 804, y: 500, z: 44, vx: 2, vz: -2, lastTouch: 3, kick: 'pass' });
    airMeets(match, player);

    expect(match.ball.owner).toBe(6);
  });
});

describe('a high ball met by the one the player steers', () => {
  it('is headed on along the stick to the mate that way', () => {
    const match = matchInPlay();
    const player = Object.assign(match.players[6], { x: 800, y: 500, noPickup: 0, stun: 0 });

    only(match, [6, 7]);
    Object.assign(match.players[7], { x: 800, y: 700, stun: 0 });
    match.controlled = 6;
    match.input.sources.keys.held.down = true;
    looseBallAt(match, { x: 804, y: 500, z: 44, vz: -2, lastTouch: 13 });
    airMeets(match, player);

    expect(match.ball.vy).toBeGreaterThan(Math.abs(match.ball.vx));
  });
});
